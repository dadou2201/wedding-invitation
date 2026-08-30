"use client";

import Image from "next/image";
import type { InvitationDisplay } from "@/lib/guest-display-name";
import type { Language } from "@/lib/types";

interface OpeningCardProps {
  display: InvitationDisplay;
  language: Language;
  onDiscover: () => void;
}

const OPENING_COPY = {
  fr: {
    open: "Ouvrir l’invitation",
    logoAlt: "Monogramme de Clara et David",
  },
  he: {
    open: "פתיחת ההזמנה",
    logoAlt: "המונוגרמה של קלרה ודוד",
  },
} as const;

export function OpeningCard({
  display,
  language,
  onDiscover,
}: OpeningCardProps) {
  const copy = OPENING_COPY[language];
  const direction = language === "he" ? "rtl" : "ltr";

  const handleOpen = () => {
    onDiscover();
  };

  return (
    <main
      className="opening-page"
      lang={language}
      dir={direction}
    >
      <div className="opening-page__texture" aria-hidden="true" />

      <div className="opening-composition">
        <article className="opening-card" aria-labelledby="opening-names">
          <div className="opening-card__inner">
            <h1
              id="opening-names"
              className={`opening-names opening-names--${display.kind}`}
              aria-label={display.accessibleLabel}
            >
              {display.kind === "shared-last-name" ? (
                <>
                  <span className="opening-names__people">
                    <span>{display.firstNames[0]}</span>
                    <i aria-hidden="true">&amp;</i>
                    <span>{display.firstNames[1]}</span>
                  </span>
                  <span className="opening-names__surname">
                    {display.lastName}
                  </span>
                </>
              ) : display.kind === "couple" ? (
                <span className="opening-names__people opening-names__people--full">
                  <span>{display.people[0]}</span>
                  <i aria-hidden="true">&amp;</i>
                  <span>{display.people[1]}</span>
                </span>
              ) : (
                <span className="opening-names__single">{display.name}</span>
              )}
            </h1>
          </div>
        </article>

        <button
          type="button"
          className="opening-trigger focus-ring"
          onClick={handleOpen}
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
      </div>
    </main>
  );
}
