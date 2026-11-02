/** Riwayah (narration) text bundled from KFGQPC data by scripts/prepare-riwayat.py. */
export type RiwayahKey = "hafs" | "duri" | "warsh" | "qalun" | "bazzi";
export type RiwayahVerse = { id: number; text: string };

export const RIWAYAH_LABEL: Record<RiwayahKey, string> = {
  hafs: "Hafs an Asim",
  duri: "Al-Duri an Abi Amr",
  warsh: "Warsh an Nafi",
  qalun: "Qalun an Nafi",
  bazzi: "Al-Bazzi an Ibn Kathir",
};

/** Map a reciter's riwayah label to a bundled text, or null when no text is bundled for it. */
export function riwayahKey(label: string): RiwayahKey | null {
  const s = label.toLowerCase();
  if (s.includes("hafs")) return "hafs";
  if ((s.includes("duri") || s.includes("dori")) && s.includes("amr")) return "duri";
  if (s.includes("warsh")) return "warsh";
  if (s.includes("qalon") || s.includes("qalun") || s.includes("qaloon")) return "qalun";
  if (s.includes("bizi") || s.includes("bazzi")) return "bazzi";
  return null;
}

export async function fetchRiwayahChapter(key: Exclude<RiwayahKey, "hafs">, chapter: number): Promise<RiwayahVerse[]> {
  const res = await fetch(`/quran/riwayat/${key}/${chapter}.json`);
  if (!res.ok) throw new Error("Riwayah text unavailable");
  return res.json() as Promise<RiwayahVerse[]>;
}

/** Reduce Uthmani text to its bare letters so only wording (not vowel marks) is compared. */
export function bareLetters(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08D3-\u08FF]/g, "")
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\s+/g, " ")
    .trim();
}

/** Words of `other` marked true when they have no counterpart in `hafs` (word-level LCS on bare letters). */
export function markDifferences(other: string, hafs: string): { word: string; differs: boolean }[] {
  const a = other.split(/\s+/).filter(Boolean);
  const b = hafs.split(/\s+/).filter(Boolean).map(bareLetters);
  const an = a.map(bareLetters);
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i]![j] = an[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const out: { word: string; differs: boolean }[] = [];
  let i = 0, j = 0;
  while (i < a.length) {
    if (j < b.length && an[i] === b[j]) { out.push({ word: a[i]!, differs: false }); i++; j++; }
    else if (j < b.length && dp[i]![j + 1]! >= dp[i + 1]![j]!) j++;
    else { out.push({ word: a[i]!, differs: true }); i++; }
  }
  return out;
}
