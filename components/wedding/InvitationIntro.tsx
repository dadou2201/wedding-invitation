import Image from "next/image";
import { Fragment } from "react";
import type { EventKey, Language, WeddingEvent } from "@/lib/types";

interface InvitationIntroProps {
  brideName: string;
  events: WeddingEvent[];
  groomName: string;
  language: Language;
  showRsvp: boolean;
}

const INTRO_COPY = {
  fr: {
    navigation: "Accès rapide aux invitations",
    rsvp: "RSVP",
    scroll: "Faire défiler",
  },
  he: {
    navigation: "ניווט מהיר להזמנות",
    rsvp: "אישור הגעה",
    scroll: "גללו מטה",
  },
} as const;

const EVENT_LABELS: Record<Language, Record<EventKey, string>> = {
  fr: {
    wedding: "Houppa",
    henna: "Henné",
    shabbat: "Chabbat Hatan",
  },
  he: {
    wedding: "חופה",
    henna: "חינה",
    shabbat: "שבת חתן",
  },
};

export function InvitationIntro({
  brideName,
  events,
  groomName,
  language,
  showRsvp,
}: InvitationIntroProps) {
  const copy = INTRO_COPY[language];
  const firstEvent = events[0];
  const navigationItems = [
    ...events.map((event) => ({
      href: `#${event.key}`,
      key: event.key,
      label: EVENT_LABELS[language][event.key],
    })),
    ...(showRsvp
      ? [{ href: "#rsvp", key: "rsvp", label: copy.rsvp }]
      : []),
  ];

  return (
    <section
      id="introduction"
      className="invitation-intro-slide"
      aria-labelledby="invitation-intro-title"
    >
      <div className="invitation-intro-photo">
        <Image
          src="/images/intro.jpg"
          alt={`${brideName} & ${groomName}`}
          fill
          sizes="(min-width: 64rem) 40rem, 100vw"
          loading="eager"
          fetchPriority="high"
          className="invitation-intro-slide__image"
        />
        <span className="invitation-intro-slide__veil" aria-hidden="true" />
        <div className="invitation-intro-names">
          <h1 id="invitation-intro-title">
            <span>{brideName}</span>
            <i>&amp;</i>
            <span>{groomName}</span>
          </h1>
          <time dateTime="2026-11-02">02.11.2026</time>
        </div>
      </div>

      <nav className="invitation-intro-menu" aria-label={copy.navigation}>
        {navigationItems.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 && (
              <span
                className="invitation-intro-menu__separator"
                aria-hidden="true"
              >
                ◆
              </span>
            )}
            <a href={item.href}>{item.label}</a>
          </Fragment>
        ))}
      </nav>

      {firstEvent && (
        <a
          href={`#${firstEvent.key}`}
          className="invitation-intro-scroll focus-ring"
          aria-label={copy.scroll}
        >
          <span>{copy.scroll}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      )}
    </section>
  );
}
