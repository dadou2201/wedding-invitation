"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { submitRsvp } from "@/app/i/[token]/rsvp-actions";
import { getTranslations } from "@/lib/translations";
import type {
  EventKey,
  Guest,
  Language,
  RsvpPerson,
  RsvpStatus,
  ShuttleCity,
  WeddingEvent,
  WeddingSettings,
} from "@/lib/types";

interface RSVPFormProps {
  events: WeddingEvent[];
  guest: Guest;
  language: Language;
  rsvpPeople: RsvpPerson[];
  settings: WeddingSettings;
  token: string;
}

export function RSVPForm({
  events,
  guest,
  language,
  rsvpPeople,
  settings,
  token,
}: RSVPFormProps) {
  const t = getTranslations(language).rsvp;
  const showGuestCounter = rsvpPeople.length === 1 && guest.maxGuests > 1;
  const hasPendingResponse = rsvpPeople.some((person) =>
    events.some((event) => person.responses[event.key] === "pending"),
  );
  const [responsesByPerson, setResponsesByPerson] = useState<
    Record<string, Record<EventKey, RsvpStatus>>
  >(() =>
    Object.fromEntries(
      rsvpPeople.map((person) => [person.id, { ...person.responses }]),
    ),
  );
  const [guestsCount, setGuestsCount] = useState(
    Math.min(Math.max(guest.guestsCount, 1), guest.maxGuests),
  );
  const [shuttleInterest, setShuttleInterest] = useState<ShuttleCity[]>(
    guest.shuttleInterest.slice(0, 1),
  );
  const [message, setMessage] = useState(guest.message);
  const [isEditing, setIsEditing] = useState(
    !guest.answeredAt || hasPendingResponse,
  );
  const [isPersisted, setIsPersisted] = useState(
    Boolean(guest.answeredAt) && !hasPendingResponse,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const people = rsvpPeople.map((person) => ({
    ...person,
    responses: responsesByPerson[person.id] ?? person.responses,
  }));
  const getEventTitle = (event: WeddingEvent) => {
    if (language !== "fr") {
      return event.title[language];
    }

    return {
      wedding: "Mariage",
      henna: "Henné",
      shabbat: "Chabbat Hatan",
    }[event.key];
  };

  const updateResponse = (
    event: WeddingEvent,
    personId: string,
    status: RsvpStatus,
  ) => {
    setResponsesByPerson((current) => ({
      ...current,
      [personId]: {
        ...current[personId],
        [event.key]: status,
      },
    }));

    setError("");
  };

  const showConfirmation = () => {
    setIsEditing(false);
    window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      document.getElementById("rsvp")?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 0);
  };

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    if (
      people.some((person) =>
        events.some((event) => person.responses[event.key] === "pending"),
      )
    ) {
      setError(t.required);
      return;
    }

    if (isSubmitting) {
      return;
    }

    const submittedPeople = people.map((person) => ({
      id: person.id,
      responses: Object.fromEntries(
        events.map((event) => [event.key, person.responses[event.key]]),
      ) as Partial<Record<EventKey, RsvpStatus>>,
    }));

    setIsSubmitting(true);
    setError("");

    try {
      const result = await submitRsvp({
        token,
        people: submittedPeople,
        guestsCount,
        shuttleInterest,
        message,
      });

      if (!result.ok) {
        setError(result.error === "invalid" ? t.invalid : t.unavailable);
        return;
      }

      setIsPersisted(result.persisted);

      showConfirmation();
    } catch {
      setError(t.unavailable);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp"
      className={`rsvp-section${isEditing ? "" : " rsvp-section--confirmed"}`}
      aria-labelledby="rsvp-title"
    >
      {isEditing ? (
        <div className="section-shell rsvp-shell reveal-section">
          <div className="rsvp-heading">
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 id="rsvp-title" className="section-title">
              {t.title}
            </h2>
            <p className="rsvp-intro">{t.intro}</p>
          </div>

          <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
            <div className="rsvp-events">
              {events.map((event) => (
                <fieldset className="rsvp-event" key={event.key}>
                  <legend>{getEventTitle(event)}</legend>
                  <div className="rsvp-people">
                    {people.map((person) => (
                      <div className="rsvp-person-row" key={person.id}>
                        <p className="rsvp-person-name">{person.name}</p>
                        <div className="rsvp-person-options">
                          {(["yes", "no"] as const).map((status) => {
                            const inputId = `${event.key}-${person.id}-${status}`;
                            const selected =
                              person.responses[event.key] === status;

                            return (
                              <div className="rsvp-person-choice" key={status}>
                                <input
                                  id={inputId}
                                  type="radio"
                                  name={`${event.key}-${person.id}`}
                                  value={status}
                                  checked={selected}
                                  onChange={() =>
                                    updateResponse(event, person.id, status)
                                  }
                                />
                                <label
                                  htmlFor={inputId}
                                  className={
                                    selected ? "is-selected" : undefined
                                  }
                                >
                                  {status === "yes" ? t.yes : t.no}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            {showGuestCounter && (
              <fieldset className="guest-count-fieldset">
                <legend>{t.guestCount}</legend>
                <div className="guest-count-stepper">
                <button
                  type="button"
                  aria-label={t.decreaseGuestCount}
                  disabled={guestsCount <= 1}
                  onClick={() =>
                    setGuestsCount((current) => Math.max(1, current - 1))
                  }
                >
                  <span aria-hidden="true">−</span>
                </button>
                <output aria-live="polite">{guestsCount}</output>
                <button
                  type="button"
                  aria-label={t.increaseGuestCount}
                  disabled={guestsCount >= guest.maxGuests}
                  onClick={() =>
                    setGuestsCount((current) =>
                      Math.min(guest.maxGuests, current + 1),
                    )
                  }
                >
                  <span aria-hidden="true">+</span>
                </button>
                </div>
              </fieldset>
            )}

            <fieldset className="shuttle-fieldset">
              <legend>{t.shuttleLabel}</legend>
              <p>{t.shuttleHelp}</p>
              <div className="shuttle-options">
                {(["Jerusalem", "Tel Aviv"] as const).map((city) => {
                  const inputId = `shuttle-${city.replace(" ", "-").toLowerCase()}`;
                  const selected = shuttleInterest.includes(city);

                  return (
                    <div className="rsvp-choice" key={city}>
                      <input
                        id={inputId}
                        type="checkbox"
                        name="shuttle-interest"
                        value={city}
                        checked={selected}
                        onChange={() =>
                          setShuttleInterest((current) =>
                            current.includes(city) ? [] : [city],
                          )
                        }
                      />
                      <label
                        htmlFor={inputId}
                        className={selected ? "is-selected" : undefined}
                      >
                        <span className="choice-mark" aria-hidden="true" />
                        <span>
                          {city === "Jerusalem"
                            ? t.shuttleJerusalem
                            : t.shuttleTelAviv}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <div className="form-field form-field--message">
              <label htmlFor="wedding-message">{t.messageLabel}</label>
              <p className="rsvp-message-help">{t.messageHelp}</p>
              <textarea
                id="wedding-message"
                value={message}
                maxLength={600}
                rows={4}
                placeholder={t.messagePlaceholder}
                onChange={(event) => setMessage(event.target.value)}
              />
              <span className="character-count" aria-hidden="true">
                {message.length}/600
              </span>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="primary-button focus-ring"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? t.submitting : t.submit}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </button>
            <p className="preview-note">{t.storageNote}</p>
          </form>
        </div>
      ) : (
        <div className="rsvp-confirmation-page reveal-section is-visible">
          <div className="rsvp-confirmation-card">
            <div className="rsvp-confirmation-card__inner">
              <Image
                src="/images/logo2.jpg"
                alt={`Logo ${settings.brideName} et ${settings.groomName}`}
                width={1254}
                height={1254}
                sizes="112px"
                className="rsvp-confirmation-logo"
              />
              <span className="rsvp-confirmation-check" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="22" />
                  <path d="m14 24 7 7 14-15" />
                </svg>
              </span>
              <p className="rsvp-confirmation-eyebrow">{t.savedEyebrow}</p>
              <h2 id="rsvp-title" className="rsvp-confirmation-title">
                {t.savedTitle(guest.firstName)}
              </h2>
              <p className="rsvp-confirmation-text">{t.savedText}</p>

              <div className="rsvp-confirmation-summary">
                <p>{t.summary}</p>
                <dl>
                  {events.map((event) => (
                    <div className="rsvp-confirmation-event" key={event.key}>
                      <dt>{getEventTitle(event)}</dt>
                      <dd className="rsvp-confirmation-people">
                        {people.map((person) => (
                          <span key={person.id}>
                            <b>{person.name}</b>
                            <em data-status={person.responses[event.key]}>
                              {t.statuses[person.responses[event.key]]}
                            </em>
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                  {showGuestCounter && (
                    <div>
                      <dt>{t.guestCount}</dt>
                      <dd>{t.guestSummary(guestsCount)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <button
                type="button"
                className="rsvp-confirmation-edit focus-ring"
                onClick={() => setIsEditing(true)}
              >
                {t.edit}
              </button>
              <p className="rsvp-confirmation-note">
                {isPersisted ? t.savedNote : t.developmentNote}
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="rsvp-finale">
        <span aria-hidden="true" />
        <Image
          src="/images/logo2.jpg"
          alt={`Logo ${settings.brideName} et ${settings.groomName}`}
          width={1254}
          height={1254}
          sizes="(max-width: 480px) 64px, 72px"
        />
      </footer>
    </section>
  );
}
