import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, LocateFixed } from "lucide-react";
import { RamadanIcon } from "@/components/icons/islamic";
import { CITIES, METHODS, PRAYERS, daysUntilRamadan, formatDuration, formatTime, hijri, nextPrayer, timesFor, type MethodId } from "@/lib/prayer";
import { useStored } from "@/lib/devotion";
import { useNow, usePrayerSettings } from "@/lib/use-prayer";
import { PageTitle } from "@/components/dhikr-list";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/ramadan")({
  head: () => ({
    meta: [
      { title: "Prayer times & Ramadan — My Quran" },
      { name: "description", content: "Offline prayer times, suhoor and iftar times, Hijri date and a Ramadan fasting tracker." },
      { property: "og:title", content: "Prayer times & Ramadan — My Quran" },
      { property: "og:description", content: "Offline prayer times, suhoor and iftar, and a fasting tracker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RamadanPage,
});

function RamadanPage() {
  const { t } = useLang();
  const now = useNow();
  const [s, setS] = usePrayerSettings();
  const [locating, setLocating] = useState<"" | "busy" | "denied">("");
  const h = now ? hijri(now, s.hijriOffset) : null;
  const inRamadan = h?.month === 9;
  const [fasts, setFasts] = useStored<number[]>(`fasting-${h?.year ?? "x"}`, []);
  const times = now ? timesFor(s, now) : null;
  const next = now ? nextPrayer(s, now) : null;

  const locate = () => {
    if (!navigator.geolocation) return setLocating("denied");
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      (p) => { setS((x) => ({ ...x, city: "custom", custom: { lat: p.coords.latitude, lng: p.coords.longitude } })); setLocating(""); },
      () => setLocating("denied"),
      { timeout: 10000 },
    );
  };

  const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
  return (
    <main className="mx-auto max-w-3xl px-4 pb-10">
      <PageTitle title={t("ramadanTitle")} sub={t("ramadanSub")} />

      <section className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft">
        <div className="flex items-center gap-2 text-sm opacity-90"><RamadanIcon size={18} tone="mono" /> {h?.label ?? "…"}</div>
        <p className="mt-3 font-display text-3xl">
          {!h ? "…" : inRamadan ? t("ramadanDay", { n: h.day }) : t("ramadanIn", { n: daysUntilRamadan(now!, s.hijriOffset) })}
        </p>
        {times && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-foreground/10 p-4"><p className="text-xs opacity-80">{t("suhoorEnds")}</p><p className="mt-1 text-2xl font-semibold">{formatTime(times.fajr)}</p></div>
            <div className="rounded-xl bg-primary-foreground/10 p-4"><p className="text-xs opacity-80">{t("iftar")}</p><p className="mt-1 text-2xl font-semibold">{formatTime(times.maghrib)}</p></div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-foreground">{t("prayerTimes")}</h2>
          {next && now && <span className="text-sm text-muted-foreground">{t(next.name)} {t("inTime", { t: formatDuration(next.at.getTime() - now.getTime()) })}</span>}
        </div>
        <ul className="mt-4 divide-y divide-border">
          {PRAYERS.map((p) => (
            <li key={p} className={`flex items-center justify-between py-3 ${next?.name === p ? "font-semibold text-primary" : "text-foreground"}`}>
              <span>{t(p)}</span>
              <span className="tabular-nums">{times ? formatTime(times[p]) : "—"}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{t("timesNote")}</p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-foreground">{t("fastingTracker")}</h2>
          <span className="text-sm text-muted-foreground">{t("fastsDone", { n: fasts.length })}</span>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-10">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const on = fasts.includes(d);
            return (
              <button
                key={d}
                aria-pressed={on}
                onClick={() => setFasts((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]))}
                className={`aspect-square rounded-xl text-sm font-medium transition ${on ? "bg-primary text-primary-foreground" : inRamadan && h?.day === d ? "border-2 border-primary text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {d}
              </button>
            );
          })}
        </div>
        <Link to="/duas/$category" params={{ category: "fasting" }} className="mt-5 flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary">
          {t("ramadanDuas")} <ChevronRight size={16} />
        </Link>
      </section>

      <section className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-soft sm:grid-cols-2">
        <label className="space-y-1 text-sm text-muted-foreground">
          {t("location")}
          <select className={field} value={s.city} onChange={(e) => setS((x) => ({ ...x, city: e.target.value }))}>
            {s.custom && <option value="custom">{t("myLocation")}</option>}
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="flex items-end">
          <button onClick={locate} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground hover:border-primary">
            <LocateFixed size={16} /> {locating === "busy" ? t("locating") : t("useMyLocation")}
          </button>
        </div>
        {locating === "denied" && <p className="text-sm text-destructive sm:col-span-2">{t("locationDenied")}</p>}
        <label className="space-y-1 text-sm text-muted-foreground">
          {t("method")}
          <select className={field} value={s.method} onChange={(e) => setS((x) => ({ ...x, method: e.target.value as MethodId }))}>
            {Object.entries(METHODS).map(([id, m]) => <option key={id} value={id}>{m.label}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm text-muted-foreground">
          {t("asrMethod")}
          <select className={field} value={s.hanafi ? "h" : "s"} onChange={(e) => setS((x) => ({ ...x, hanafi: e.target.value === "h" }))}>
            <option value="s">{t("asrStandard")}</option>
            <option value="h">{t("asrHanafi")}</option>
          </select>
        </label>
        <label className="space-y-1 text-sm text-muted-foreground sm:col-span-2">
          {t("hijriAdjust")} · <span className="text-xs">{t("hijriAdjustHelp")}</span>
          <select className={field} value={s.hijriOffset} onChange={(e) => setS((x) => ({ ...x, hijriOffset: Number(e.target.value) }))}>
            {[-2, -1, 0, 1, 2].map((n) => <option key={n} value={n}>{n > 0 ? `+${n}` : n} {t("days")}</option>)}
          </select>
        </label>
      </section>
    </main>
  );
}
