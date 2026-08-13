"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitRsvp } from "@/app/i/[token]/rsvp-actions";
import { rememberPersonalInvitation } from "@/lib/invitation-return";
import { getTranslations } from "@/lib/translations";
import type {
  EventKey,
  Guest,
  Language,
  RsvpStatus,
  ShuttleCity,
  WeddingEvent,
  WeddingSettings,
} from "@/lib/types";

interface RSVPFormProps {
  events: WeddingEvent[];
  guest: Guest;
  language: Language;
  settings: WeddingSettings;
  token: string;
  isGlobalInvitation?: boolean;
}

export function RSVPForm({
  events,
  guest,
  language,
  settings,
  token,
  isGlobalInvitation = false,
}: RSVPFormProps) {
  const router = useRouter();
  const t = getTranslations(language).rsvp;
  const [responses, setResponses] = useState(guest.rsvp);
  const [guestsCount, setGuestsCount] = useState(
    Math.min(Math.max(guest.guestsCount, 1), guest.maxGuests),
  );
  const [shuttleInterest, setShuttleInterest] = useState<ShuttleCity[]>(
    guest.shuttleInterest.slice(0, 1),
  );
  const [message, setMessage] = useState(guest.message);
  const [firstName, setFirstName] = useState(
    isGlobalInvitation ? "" : guest.firstName,
  );
  const [lastName, setLastName] = useState("");
  const [isEditing, setIsEditing] = useState(
    isGlobalInvitation || !guest.answeredAt,
  );
  const [isPersisted, setIsPersisted] = useState(Boolean(guest.answeredAt));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateResponse = (event: WeddingEvent, status: RsvpStatus) => {
    setResponses((current) => ({ ...current, [event.key]: status }));
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

    if (events.some((event) => responses[event.key] === "pending")) {
      setError(t.required);
      return;
    }

    if (isGlobalInvitation && (!firstName.trim() || !lastName.trim())) {
      setError(t.identityRequired);
      return;
    }

    if (isSubmitting) {
      return;
    }

    const submittedResponses = Object.fromEntries(
      events.map((event) => [event.key, responses[event.key]]),
    ) as Partial<Record<EventKey, RsvpStatus>>;

    setIsSubmitting(true);
    setError("");

    try {
      const result = await submitRsvp({
        token,
        responses: submittedResponses,
        guestsCount,
        shuttleInterest,
        message,
        firstName,
        lastName,
        language,
      });

      if (!result.ok) {
        setError(result.error === "invalid" ? t.invalid : t.unavailable);
        return;
      }

      setIsPersisted(result.persisted);

      if (result.invitationToken) {
        rememberPersonalInvitation(token, result.invitationToken);
        router.replace(`/i/${result.invitationToken}#rsvp`);
        return;
      }

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
            {isGlobalInvitation && (
              <div className="rsvp-identity-fields">
                <div className="form-field">
                  <label htmlFor="guest-first-name">{t.firstNameLabel}</label>
                  <input
                    id="guest-first-name"
                    type="text"
                    value={firstName}
                    maxLength={80}
                    autoComplete="given-name"
                    placeholder={t.firstNamePlaceholder}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="guest-last-name">{t.lastNameLabel}</label>
                  <input
                    id="guest-last-name"
                    type="text"
                    value={lastName}
                    maxLength={80}
                    autoComplete="family-name"
                    placeholder={t.lastNamePlaceholder}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      setError("");
                    }}
                  />
                </div>
              </div>
            )}

            <div className="rsvp-events">
              {events.map((event) => (
                <fieldset className="rsvp-event" key={event.key}>
                  <legend>{event.title[language]}</legend>
                  <div className="rsvp-options">
                    {(["yes", "no"] as const).map((status) => {
                      const inputId = `${event.key}-${status}`;
                      const selected = responses[event.key] === status;

                      return (
                        <div className="rsvp-choice" key={status}>
                          <input
                            id={inputId}
                            type="radio"
                            name={event.key}
                            value={status}
                            checked={selected}
                            onChange={() => updateResponse(event, status)}
                          />
                          <label
                            htmlFor={inputId}
                            className={selected ? "is-selected" : undefined}
                          >
                            <span className="choice-mark" aria-hidden="true" />
                            <span>{status === "yes" ? t.yes : t.no}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

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
          <Image
            src="/images/nous5.jpg"
            alt={`${settings.brideName} & ${settings.groomName}`}
            fill
            sizes="100vw"
            className="rsvp-confirmation-page__image"
          />
          <span className="rsvp-confirmation-page__veil" aria-hidden="true" />

          <div className="rsvp-confirmation-card">
            <div className="rsvp-confirmation-card__inner">
              <p className="rsvp-confirmation-monogram" dir="ltr">
                {settings.brideName.charAt(0)}
                <span>&amp;</span>
                {settings.groomName.charAt(0)}
              </p>
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
                    <div key={event.key}>
                      <dt>{event.title[language]}</dt>
                      <dd data-status={responses[event.key]}>
                        {t.statuses[responses[event.key]]}
                      </dd>
                    </div>
                  ))}
                  <div>
                    <dt>{t.guestCount}</dt>
                    <dd>{t.guestSummary(guestsCount)}</dd>
                  </div>
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
    </section>
  );
}
