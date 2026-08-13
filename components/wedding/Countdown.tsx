"use client";

import { useEffect, useState } from "react";
import { getTranslations } from "@/lib/translations";
import type { Language } from "@/lib/types";

interface CountdownProps {
  date: string;
  language: Language;
}

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  complete: boolean;
}

function calculateCountdown(date: string): CountdownValue {
  const distance = Math.max(0, new Date(date).getTime() - Date.now());
  const totalMinutes = Math.floor(distance / 60000);

  return {
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes / 60) % 24),
    minutes: totalMinutes % 60,
    complete: distance === 0,
  };
}

export function Countdown({ date, language }: CountdownProps) {
  const [countdown, setCountdown] = useState<CountdownValue | null>(null);
  const t = getTranslations(language).countdown;

  useEffect(() => {
    const update = () => setCountdown(calculateCountdown(date));
    update();
    const interval = window.setInterval(update, 60_000);

    return () => window.clearInterval(interval);
  }, [date]);

  return (
    <section className="countdown-section reveal-section" aria-labelledby="countdown-title">
      <div className="section-shell countdown-inner">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 id="countdown-title" className="section-title section-title--compact">
          {countdown?.complete ? t.complete : t.title}
        </h2>

        {!countdown?.complete && (
          <div className="countdown-grid" aria-live="off">
            {(["days", "hours", "minutes"] as const).map((unit) => (
              <div className="countdown-item" key={unit}>
                <span className="countdown-value">
                  {countdown ? String(countdown[unit]).padStart(2, "0") : "—"}
                </span>
                <span className="countdown-label">{t.units[unit]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
