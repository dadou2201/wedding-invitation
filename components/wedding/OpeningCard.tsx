"use client";

import Image from "next/image";
import { useState } from "react";
import { getInvitationDisplayName } from "@/lib/guest-display-name";
import type { Guest, Language } from "@/lib/types";

interface OpeningCardProps {
  guest: Guest;
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

const EXIT_DURATION_MS = 720;

export function OpeningCard({
  guest,
  language,
  onDiscover,
}: OpeningCardProps) {
  const [isClosing, setIsClosing] = useState(false);
  const copy = OPENING_COPY[language];
  const displayName = getInvitationDisplayName(guest);
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
        <article className="opening-card" aria-labelledby="opening-names">
          <div className="opening-card__inner">
            <p className="opening-title">{copy.invitation}</p>
            <span className="opening-divider" aria-hidden="true" />
            <h1 id="opening-names" className="opening-names">
              {displayName}
            </h1>
          </div>
        </article>

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
                src="/images/monogram-cd-white.png"
                alt={copy.logoAlt}
                width={120}
                height={80}
                priority
              />
            </span>
          </span>
          <span className="opening-trigger__label">{copy.open}</span>
        </button>
      </div>
    </main>
  );
}
