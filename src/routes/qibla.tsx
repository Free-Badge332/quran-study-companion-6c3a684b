import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QiblaIcon } from "@/components/icons/islamic";
import { PageTitle } from "@/components/dhikr-list";
import { CITIES, coordsFor } from "@/lib/prayer";
import { usePrayerSettings } from "@/lib/use-prayer";
import { compassPoint, distanceToKaaba, qiblaBearing } from "@/lib/qibla";

export const Route = createFileRoute("/qibla")({
  head: () => ({
    meta: [
      { title: "Qibla direction — My Quran" },
      { name: "description", content: "Find the direction of the Kaaba from your city, fully offline and without GPS." },
      { property: "og:title", content: "Qibla direction — My Quran" },
      { property: "og:description", content: "Offline Qibla compass based on your saved city." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QiblaPage,
});

type OrientEvt = DeviceOrientationEvent & { webkitCompassHeading?: number };

function useHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    if (D?.requestPermission) setNeedsPermission(true);
    else setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onEvt = (e: Event) => {
      const ev = e as OrientEvt;
      if (typeof ev.webkitCompassHeading === "number") setHeading(ev.webkitCompassHeading);
      else if (ev.absolute && ev.alpha != null) setHeading((360 - ev.alpha) % 360);
    };
    window.addEventListener("deviceorientationabsolute", onEvt);
    window.addEventListener("deviceorientation", onEvt);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onEvt);
      window.removeEventListener("deviceorientation", onEvt);
    };
  }, [active]);

  const request = async () => {
    const D = (window as unknown as { DeviceOrientationEvent: { requestPermission: () => Promise<string> } }).DeviceOrientationEvent;
    try {
      if ((await D.requestPermission()) === "granted") { setNeedsPermission(false); setActive(true); }
    } catch { /* user declined */ }
  };
  return { heading, needsPermission, request };
}

function QiblaPage() {
  const [settings] = usePrayerSettings();
  const { lat, lng } = coordsFor(settings);
  const cityName = settings.city === "custom" ? "Custom location" : (CITIES.find((c) => c.id === settings.city)?.name ?? CITIES[0]!.name);
  const bearing = qiblaBearing(lat, lng);
  const km = distanceToKaaba(lat, lng);
  const { heading, needsPermission, request } = useHeading();

  const dialRotation = heading == null ? 0 : -heading;
  const offBy = heading == null ? null : ((bearing - heading + 540) % 360) - 180;
  const aligned = offBy != null && Math.abs(offBy) < 5;

  return (
    <main className="mx-auto max-w-md px-4 pb-10">
      <PageTitle title="Qibla" sub={`From ${cityName}`} />

      <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
        <div
          className="absolute inset-0 rounded-full border border-border bg-card shadow-soft transition-transform duration-200"
          style={{ transform: `rotate(${dialRotation}deg)` }}
        >
          {["N", "E", "S", "W"].map((p, i) => (
            <span key={p} className="absolute inset-0 flex justify-center pt-3 text-xs font-semibold text-muted-foreground" style={{ transform: `rotate(${i * 90}deg)` }}>
              <span className={p === "N" ? "text-destructive" : ""}>{p}</span>
            </span>
          ))}
          <div className="absolute inset-0 flex justify-center" style={{ transform: `rotate(${bearing}deg)` }}>
            <div className="flex flex-col items-center pt-8">
              <span className={`grid h-12 w-12 place-items-center rounded-full ${aligned ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                <QiblaIcon size={26} />
              </span>
              <span className="mt-1 h-20 w-1 rounded-full bg-primary" />
            </div>
          </div>
        </div>
        <span className="absolute left-1/2 top-0 h-4 w-1 -translate-x-1/2 -translate-y-2 rounded-full bg-foreground" aria-hidden />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" aria-hidden />
      </div>

      <div className="mt-8 text-center">
        <p className="font-display text-5xl text-foreground">{Math.round(bearing)}°</p>
        <p className="mt-1 text-muted-foreground">{compassPoint(bearing)} from true north · {Math.round(km).toLocaleString()} km to the Kaaba</p>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {heading == null
            ? "No compass detected. Face the angle above using a compass, or hold your phone flat to use its sensor."
            : aligned
              ? "You are facing the Qibla."
              : `Turn ${offBy! > 0 ? "right" : "left"} ${Math.abs(Math.round(offBy!))}°`}
        </p>
        {needsPermission && (
          <button onClick={request} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
            Use phone compass
          </button>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          Uses your saved prayer city, not GPS. <Link to="/ramadan" className="text-primary underline">Change city</Link>. Keep away from metal and magnets for accuracy.
        </p>
      </div>
    </main>
  );
}
