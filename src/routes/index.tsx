import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { ChevronRight } from "lucide-react";
import { DuaIcon, HadithIcon, LecturesIcon, MosqueIcon, QiblaIcon, QuranIcon, RamadanIcon, ReadingProgressIcon, TasbihIcon } from "@/components/icons/islamic";
import { DailyVerse } from "@/components/daily-verse";
import { DownloadedQuran } from "@/components/downloaded-quran";
import { CHAPTER_LIST } from "@/lib/quran";
import { useOfflineAudio } from "@/lib/offline-audio";
import { useProgress } from "@/lib/progress";
import { formatDuration, formatTime, hijri, nextPrayer, timesFor } from "@/lib/prayer";
import { useNow, usePrayerSettings } from "@/lib/use-prayer";
import type { MsgKey } from "@/lib/i18n";
import { useLang } from "@/lib/lang";
import { coordsFor } from "@/lib/prayer";
import { compassPoint, qiblaBearing } from "@/lib/qibla";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Quran — Quran, azkar, duas and prayer times" },
      { name: "description", content: "Read the Quran, keep your daily azkar, find duas and see prayer and Ramadan times — all offline." },
      { property: "og:title", content: "My Quran — Quran, azkar, duas and prayer times" },
      { property: "og:description", content: "Quran, hadith, azkar, duas and prayer times in English, Amharic and Afaan Oromoo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Tile = { to: "/quran" | "/azkar" | "/duas" | "/hadith" | "/ramadan" | "/lectures" | "/community" | "/qibla"; label: MsgKey; icon: ComponentType<{ size?: number }> };
const TILES: Tile[] = [
  { to: "/quran", label: "navQuran", icon: QuranIcon },
  { to: "/azkar", label: "navAzkar", icon: TasbihIcon },
  { to: "/duas", label: "navDuas", icon: DuaIcon },
  { to: "/hadith", label: "navHadith", icon: HadithIcon },
  { to: "/ramadan", label: "navRamadan", icon: RamadanIcon },
  { to: "/qibla", label: "navQibla", icon: QiblaIcon },
  { to: "/lectures", label: "navLectures", icon: LecturesIcon },
  { to: "/community", label: "navCommunity", icon: MosqueIcon },
];

function Home() {
  const { lang, t } = useLang();
  const now = useNow();
  const [s] = usePrayerSettings();
  const progress = useProgress();
  const hasDownloads = useOfflineAudio().records.some((r) => r.status === "downloaded");
  const next = now ? nextPrayer(s, now) : null;
  const h = now ? hijri(now, s.hijriOffset) : null;
  const hour = now?.getHours() ?? 8;
  const isha = now ? timesFor(s, now).isha : null;
  const suggest = !now ? "morning" : isha && now > isha ? "sleep" : hour < 12 && hour >= 3 ? "morning" : "evening";
  const suggestKey: MsgKey = suggest === "morning" ? "morningAzkar" : suggest === "sleep" ? "sleepAzkar" : "eveningAzkar";
  const { lat, lng } = coordsFor(s);
  const qibla = qiblaBearing(lat, lng);
  const last = progress.lastRead;
  const lastMeta = last ? CHAPTER_LIST.find((c) => c.id === last.chapterId) : undefined;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-10">
      <section className="pt-6">
        <p className="text-sm text-muted-foreground">{h?.label ?? "\u00a0"}</p>
        <h1 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">{t("assalamu")}</h1>
      </section>

      <Link to="/ramadan" className="mt-5 block overflow-hidden rounded-3xl bg-primary bg-islamic-pattern p-6 text-primary-foreground shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-85">{t("nextPrayer")}</p>
            <p className="mt-1 font-display text-4xl">{next ? t(next.name) : "…"}</p>
            <p className="mt-1 text-lg tabular-nums">{next ? formatTime(next.at) : "\u00a0"}</p>
          </div>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-sm">
            {next && now ? t("inTime", { t: formatDuration(next.at.getTime() - now.getTime()) }) : "…"}
          </span>
        </div>
        <p className="mt-4 flex items-center gap-1 text-sm opacity-85">{t("prayerTimes")} <ChevronRight size={14} /></p>
      </Link>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {last && lastMeta && (
          <Link to="/chapter/$id" params={{ id: String(last.chapterId) }} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-primary">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><ReadingProgressIcon size={22} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">{t("continueReading")}</span>
              <span className="block truncate font-semibold text-foreground">{lastMeta.transliterationName} · {t("verseN", { n: last.verseId })}</span>
            </span>
            <span className="font-arabic text-xl text-primary">{lastMeta.name.ar}</span>
          </Link>
        )}
        <Link to="/azkar/$category" params={{ category: suggest }} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-primary">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><TasbihIcon size={22} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">{t("suggestedNow")}</span>
            <span className="block font-semibold text-foreground">{t(suggestKey)}</span>
          </span>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
        <Link to="/qibla" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-primary">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary" style={{ transform: `rotate(${qibla}deg)` }}><QiblaIcon size={22} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">{t("navQibla")}</span>
            <span className="block font-semibold text-foreground tabular-nums">{Math.round(qibla)}° {compassPoint(qibla)}</span>
          </span>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </div>

      <DownloadedQuran />


      <section className="mt-8">
        <h2 className="mb-3 font-display text-2xl text-foreground">{t("explore")}</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {TILES.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-2 rounded-2xl p-2 text-center transition hover:bg-card">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card text-primary shadow-soft"><Icon size={26} /></span>
              <span className="text-xs font-medium text-foreground">{t(label)}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8" lang={lang}><DailyVerse /></div>
    </main>
  );
}
