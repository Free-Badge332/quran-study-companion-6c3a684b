import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, RotateCcw } from "lucide-react";
import type { Dhikr, DhikrCategory, QuranRef } from "@/data/adhkar";
import { azkarKey, stepCount, useStored } from "@/lib/devotion";
import { fetchChapter } from "@/lib/quran";
import { useLang } from "@/lib/lang";

function QuranPassage({ refs }: { refs: QuranRef[] }) {
  return (
    <div className="space-y-4">
      {refs.map((r) => (
        <QuranRefText key={`${r.chapter}-${r.from}`} r={r} />
      ))}
    </div>
  );
}

function QuranRefText({ r }: { r: QuranRef }) {
  const { lang } = useLang();
  const q = useQuery({ queryKey: ["chapter", String(r.chapter), lang], queryFn: () => fetchChapter(String(r.chapter), lang), staleTime: Infinity });
  const verses = q.data?.verses.filter((v) => v.id >= r.from && v.id <= (r.to ?? r.from)) ?? [];
  if (!q.data) return <div className="h-16 animate-pulse rounded-md bg-muted" />;
  return (
    <div>
      <p dir="rtl" lang="ar" className="font-arabic text-2xl leading-loose text-foreground">
        {verses.map((v) => v.text).join(" ۝ ")}
      </p>
      {lang !== "ar" && verses.some((v) => v.translation) && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{verses.map((v) => v.translation).join(" ")}</p>
      )}
    </div>
  );
}

function Item({ d, value, onTap, onReset, counter }: { d: Dhikr; value: number; onTap: () => void; onReset: () => void; counter: boolean }) {
  const { t } = useLang();
  const done = value >= d.count;
  return (
    <article className={`rounded-2xl border bg-card p-5 shadow-soft transition-colors ${done && counter ? "border-primary/50" : "border-border"}`}>
      {d.quran ? <QuranPassage refs={d.quran} /> : <p dir="rtl" lang="ar" className="font-arabic text-2xl leading-loose text-foreground">{d.ar}</p>}
      {d.en && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.en}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{t("reference")}: {d.ref}</span>
        {counter && (
          <div className="flex items-center gap-2">
            {value > 0 && (
              <button onClick={onReset} aria-label={t("resetCount")} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted">
                <RotateCcw size={16} />
              </button>
            )}
            <button
              onClick={onTap}
              disabled={done}
              aria-label={`${t("tapToCount")} ${value}/${d.count}`}
              className={`flex min-w-24 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${done ? "bg-secondary text-primary" : "bg-primary text-primary-foreground"}`}
            >
              {done ? <><Check size={16} /> {t("completed")}</> : <>{value} / {d.count}</>}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function DhikrList({ category, counter = true }: { category: DhikrCategory; counter?: boolean }) {
  const { lang, t } = useLang();
  const [counts, setCounts] = useStored<Record<string, number>>(azkarKey(category.id), {});
  const done = category.items.filter((i) => (counts[i.id] ?? 0) >= i.count).length;
  const pct = Math.round((done / category.items.length) * 100);
  return (
    <div>
      {counter && (
        <div className="sticky top-16 z-10 mb-5 rounded-xl border border-border bg-card/95 p-3 backdrop-blur">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{t("progressN", { a: done, b: category.items.length })}</span>
            <button onClick={() => setCounts({})} className="text-muted-foreground hover:text-primary">{t("resetAll")}</button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {!["en", "ar"].includes(lang) && <p className="mb-4 text-xs italic text-muted-foreground">{t("englishOnly")}</p>}
      <div className="space-y-4">
        {category.items.map((d) => (
          <Item
            key={d.id}
            d={d}
            counter={counter}
            value={counts[d.id] ?? 0}
            onTap={() => setCounts((p) => ({ ...p, [d.id]: stepCount(p[d.id] ?? 0, d.count) }))}
            onReset={() => setCounts((p) => ({ ...p, [d.id]: 0 }))}
          />
        ))}
      </div>
    </div>
  );
}

/** Azkar | Duas switcher shared by both sections. */
export function DevotionTabs({ active }: { active: "azkar" | "duas" }) {
  const { t } = useLang();
  const cls = (on: boolean) => `flex flex-1 items-center justify-center rounded-full py-2.5 min-h-11 text-center text-sm font-semibold transition-colors ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`;
  return (
    <div className="mx-auto mb-6 flex max-w-xs rounded-full border border-border bg-card p-1">
      <Link to="/azkar" className={cls(active === "azkar")}>{t("navAzkar")}</Link>
      <Link to="/duas" className={cls(active === "duas")}>{t("navDuas")}</Link>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="pb-6 pt-8 text-center">
      <h1 className="font-display text-4xl text-foreground">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
    </header>
  );
}
