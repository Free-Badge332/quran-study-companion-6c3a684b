import { useQuery } from "@tanstack/react-query";
import { RIWAYAH_LABEL, fetchRiwayahChapter, markDifferences, riwayahKey, bareLetters } from "@/lib/riwayah";
import { toArabicNumber, type Chapter } from "@/lib/quran";

/** Verse text in the selected reciter's riwayah, with words that differ from Hafs highlighted. */
export function RiwayahText({ riwayah, chapter, size, full = false }: { riwayah: string; chapter: Chapter; size: number; full?: boolean }) {
  const key = riwayahKey(riwayah);
  const enabled = key !== null && key !== "hafs";
  const q = useQuery({ queryKey: ["riwayah", key, chapter.id], queryFn: () => fetchRiwayahChapter(key as Exclude<typeof key, "hafs" | null>, chapter.id), enabled, staleTime: Infinity });
  if (key === "hafs") return null;
  if (key === null) {
    return <p className="mb-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">Recited in the {riwayah} riwayah. Text for this riwayah isn't available yet, so the Hafs text is shown; some words will differ.</p>;
  }
  const verses = q.data ?? [];
  const hafs = new Map(chapter.verses.map((v) => [v.id, v.text]));
  const sameNumbering = verses.length === chapter.verses.length;
  const changed = sameNumbering ? verses.filter((v) => bareLetters(v.text) !== bareLetters(hafs.get(v.id) ?? "")).length : null;

  return (
    <section aria-label={`${RIWAYAH_LABEL[key]} text`} className={full ? "mb-4" : "mb-6 rounded-xl border border-border bg-card p-3 shadow-soft sm:p-6"}>
      <p className="text-sm text-muted-foreground" dir="ltr">
        Text in the <span className="font-medium text-foreground">{RIWAYAH_LABEL[key]}</span> riwayah, matching this recitation.{" "}
        {changed !== null ? <>Words that differ from Hafs are <mark className="rounded bg-gold/25 px-1 text-foreground">highlighted</mark> ({changed} {changed === 1 ? "verse" : "verses"} differ).</> : <>This riwayah counts the verses of this surah differently from Hafs ({verses.length} vs {chapter.verses.length}).</>}
      </p>
      {q.isPending && <div className="mt-3 h-32 animate-pulse rounded-lg bg-muted" />}
      {q.isError && <p role="alert" className="mt-3 text-sm text-destructive">Couldn't load the riwayah text.</p>}
      {full && chapter.id !== 9 && <img src="/imgs/bsm-allah.svg" alt="Bismillah" className="mx-auto mt-3 max-w-full object-contain dark:invert" style={{ height: `${3 * size}rem` }} />}
      {verses.length > 0 && (
        <p dir="rtl" lang="ar" className="mt-3 text-justify text-foreground" style={{ fontFamily: `"riwayah-${key}", var(--font-arabic)`, fontSize: `${(full ? 2.1 : 1.9) * size}rem`, lineHeight: `${(full ? 3.6 : 3.2) * size}rem`, textAlignLast: "center" }}>
          {verses.map((v) => {
            const words = sameNumbering ? markDifferences(v.text, hafs.get(v.id) ?? "") : v.text.split(/\s+/).map((word) => ({ word, differs: false }));
            return (
              <span key={v.id}>
                {words.map((w, i) => w.differs ? <mark key={i} className="rounded bg-gold/25 text-foreground">{w.word} </mark> : <span key={i}>{w.word} </span>)}
                <span className="mx-2 font-arabic text-primary">﴿{toArabicNumber(v.id)}﴾</span>
              </span>
            );
          })}
        </p>
      )}
    </section>
  );
}
