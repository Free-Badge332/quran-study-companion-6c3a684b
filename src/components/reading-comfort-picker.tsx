import { useLang } from "@/lib/lang";
import { usePreference } from "@/lib/preferences";

type ComfortLabels = Record<"title" | "help" | "size" | "spacing" | "reset", string>;
const LABELS: Record<string, ComfortLabels> = {
  en: { title: "Reading comfort", help: "Adjust the Arabic text. Changes save automatically and apply everywhere.", size: "Text size", spacing: "Line spacing", reset: "Reset" },
  am: { title: "የንባብ ምቾት", help: "የአረብኛውን ጽሑፍ ያስተካክሉ። ለውጦች ራሳቸው ይቀመጣሉ።", size: "የጽሑፍ መጠን", spacing: "የመስመር ክፍተት", reset: "ዳግም አስጀምር" },
  om: { title: "Miraanii dubbii", help: "Barreeffama Arabaa sirreessi. Jijjiiramni ofumaan kuufama.", size: "Guddina barreeffamaa", spacing: "Daangaa sararaa", reset: "Deebisii" },
  ar: { title: "راحة القراءة", help: "اضبط النص العربي. تُحفظ التغييرات تلقائيًا وتطبق في كل مكان.", size: "حجم الخط", spacing: "تباعد الأسطر", reset: "إعادة ضبط" },
};

const SAMPLE = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾";

export function ReadingComfortPicker() {
  const { lang } = useLang();
  const l = LABELS[lang] ?? LABELS["en"]!;
  const [size, setSize] = usePreference("font-size", 1);
  const [leading, setLeading] = usePreference("line-spacing", 1);
  const changed = size !== 1 || leading !== 1;
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-foreground">{l.title}</h2>
        {changed && (
          <button type="button" onClick={() => { setSize(1); setLeading(1); }}
            className="rounded-lg border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted">
            {l.reset}
          </button>
        )}
      </div>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">{l.help}</p>

      <div dir="rtl" className="mb-4 rounded-xl border border-border bg-card p-4 shadow-soft">
        <p className="min-w-0 [overflow-wrap:anywhere] text-center font-arabic text-foreground"
          style={{ fontSize: `${1.9 * size}rem`, lineHeight: `${3 * size * leading}rem` }}>
          {SAMPLE}
        </p>
      </div>

      <label className="mb-3 block text-sm text-foreground">
        <span className="mb-1 flex justify-between"><span>{l.size}</span><span className="text-muted-foreground">{Math.round(size * 100)}%</span></span>
        <input type="range" min={0.7} max={1.6} step={0.05} value={size} onChange={(e) => setSize(+e.target.value)}
          aria-label={l.size} className="w-full accent-primary" />
      </label>
      <label className="block text-sm text-foreground">
        <span className="mb-1 flex justify-between"><span>{l.spacing}</span><span className="text-muted-foreground">{Math.round(leading * 100)}%</span></span>
        <input type="range" min={0.8} max={1.4} step={0.05} value={leading} onChange={(e) => setLeading(+e.target.value)}
          aria-label={l.spacing} className="w-full accent-primary" />
      </label>
    </section>
  );
}
