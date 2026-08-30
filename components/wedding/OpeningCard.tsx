"use client";

import Image from "next/image";
import { useState } from "react";
import type { Language } from "@/lib/types";

interface OpeningCardProps {
  displayName: string;
  language: Language;
  onDiscover: () => void;
}

const OPENING_COPY = {
  fr: {
    invitation: "Invitation",
    open: "Ouvrir l’invitation",
    logoAlt: "Monogramme de Clara et David",
  },
  he: {
    invitation: "הזמנה",
    open: "פתיחת ההזמנה",
    logoAlt: "המונוגרמה של קלרה ודוד",
  },
} as const;

const EXIT_DURATION_MS = 1250;

export function OpeningCard({
  displayName,
  language,
  onDiscover,
}: OpeningCardProps) {
  const [isClosing, setIsClosing] = useState(false);
  const copy = OPENING_COPY[language];
  const direction = language === "he" ? "rtl" : "ltr";

  const handleOpen = () => {
    if (isClosing) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDiscover();
      return;
    }

    setIsClosing(true);
    window.setTimeout(onDiscover, EXIT_DURATION_MS);
  };

  return (
    <main
      className={`opening-page${isClosing ? " opening-page--closing" : ""}`}
      lang={language}
      dir={direction}
    >
      <div className="opening-page__texture" aria-hidden="true" />

      <div className="opening-composition">
        <article className="opening-envelope" aria-labelledby="opening-names">
          <span className="opening-envelope__back" aria-hidden="true" />
          <span className="opening-envelope__letter" aria-hidden="true" />
          <span className="opening-envelope__flap" aria-hidden="true" />
          <span className="opening-envelope__front" aria-hidden="true" />

          <div className="opening-envelope__address">
            <p className="opening-title">{copy.invitation}</p>
            <span className="opening-divider" aria-hidden="true" />
            <h1 id="opening-names" className="opening-names">
              {displayName}
            </h1>
          </div>

          <button
            type="button"
            className="opening-trigger focus-ring"
            onClick={handleOpen}
            disabled={isClosing}
            aria-label={copy.open}
          >
            <span className="opening-seal" aria-hidden="true">
              <span className="opening-seal__inner">
                <Image
                  src="/images/logo2.jpg"
                  alt={copy.logoAlt}
                  width={1254}
                  height={1254}
                  priority
                />
              </span>
            </span>
            <span className="opening-trigger__label">{copy.open}</span>
          </button>
        </article>
      </div>
    </main>
  );
}
