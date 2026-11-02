import { useState } from "react";
import { Check, ChevronDown, Search, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePreference } from "@/lib/preferences";
import { sortReciters, toggleFavorite } from "@/lib/playback-history";
import { RECITERS, reciterById, searchReciters } from "@/lib/reciters";

type Tab = "all" | "favorites";
const TABS: [Tab, string][] = [["all", "All"], ["favorites", "Favourites"]];

/** Searchable reciter sheet with favourites and categories. */
export function ReciterPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [favorites, setFavorites] = usePreference<string[]>("reciter-favorites", []);
  const current = reciterById(value);
  const list = sortReciters(searchReciters(RECITERS, query, tab, favorites), favorites);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-11 w-full min-w-0 justify-between gap-2 px-3" aria-label={`Reciter: ${current?.name ?? value}. Change reciter`}>
          <span className="min-w-0 truncate text-left">
            <span className="block truncate text-sm font-medium text-foreground">{current?.name ?? value}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{current ? `${current.riwayah} · ${current.kind === "surah" ? "Whole surah" : "Verse by verse"}` : ""}</span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-md flex-col gap-3 p-4">
        <DialogHeader>
          <DialogTitle>Choose a reciter</DialogTitle>
          <DialogDescription>Your choice is saved on this device.</DialogDescription>
        </DialogHeader>
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search size={16} className="text-muted-foreground" />
          <input aria-label="Search reciters" placeholder="Search name or riwayah" value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" />
        </label>
        <div role="tablist" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {TABS.map(([id, label]) => (
            <Button key={id} role="tab" aria-selected={tab === id} size="sm" variant={tab === id ? "default" : "outline"} className="shrink-0" onClick={() => setTab(id)}>{label}</Button>
          ))}
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
          {list.map((r) => {
            const fav = favorites.includes(r.id);
            return (
              <li key={r.id} className="flex items-center gap-1">
                <button type="button" onClick={() => { onChange(r.id); setOpen(false); }} aria-label={`Select ${r.name}`} aria-current={r.id === value} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{r.name}</span>
                    <span className="block truncate font-arabic text-base text-primary">{r.arabicName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.riwayah} · {r.kind === "surah" ? "Whole surah" : "Verse by verse"}</span>
                  </span>
                  {r.id === value && <Check size={18} className="shrink-0 text-primary" />}
                </button>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-pressed={fav} aria-label={`${fav ? "Remove" : "Add"} ${r.name} ${fav ? "from" : "to"} favourites`} onClick={() => setFavorites(toggleFavorite(favorites, r.id))}>
                  <Star size={18} className={fav ? "fill-gold text-gold" : "text-muted-foreground"} />
                </Button>
              </li>
            );
          })}
        </ul>
        {!list.length && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {tab === "favorites" ? "Tap the star next to a reciter to add a favourite." : "No reciters match."}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
