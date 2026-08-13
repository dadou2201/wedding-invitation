"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { EventSections } from "@/components/wedding/EventSections";
import { OpeningCard } from "@/components/wedding/OpeningCard";
import { RSVPForm } from "@/components/wedding/RSVPForm";
import { getRememberedPersonalInvitation } from "@/lib/invitation-return";
import { getInvitedEvents } from "@/lib/invitation-utils";
import { getTranslations } from "@/lib/translations";
import { isGlobalInvitationToken } from "@/lib/invitation-tokens";
import type { InvitationData, Language } from "@/lib/types";

interface InvitationExperienceProps {
  invitation: InvitationData;
  token: string;
}

function subscribeToRememberedInvitation() {
  return () => undefined;
}

export function InvitationExperience({
  invitation,
  token,
}: InvitationExperienceProps) {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(
    invitation.guest.preferredLanguage,
  );
  const { guest, settings } = invitation;
  const isGlobalInvitation = isGlobalInvitationToken(token);
  const t = getTranslations(language);
  const direction = language === "he" ? "rtl" : "ltr";
  const invitedEvents = useMemo(
    () => getInvitedEvents(invitation.events, guest),
    [guest, invitation.events],
  );
  const rememberedPersonalToken = useSyncExternalStore(
    subscribeToRememberedInvitation,
    () =>
      isGlobalInvitation ? getRememberedPersonalInvitation(token) : null,
    () => null,
  );

  useEffect(() => {
    if (!rememberedPersonalToken) {
      return;
    }

    window.location.replace(
      `/i/${encodeURIComponent(rememberedPersonalToken)}#rsvp`,
    );
  }, [rememberedPersonalToken]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = direction;
  }, [direction, language]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("invitation-snap-active", isInvitationOpen);

    return () => root.classList.remove("invitation-snap-active");
  }, [isInvitationOpen]);

  useEffect(() => {
    if (!isInvitationOpen) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elements = document.querySelectorAll<HTMLElement>(".reveal-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        element.classList.add("is-visible");
      } else {
        element.classList.add("is-reveal-ready");
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [isInvitationOpen]);

  if (rememberedPersonalToken) {
    return (
      <main
        className="invitation-loading"
        aria-busy="true"
        aria-label="Chargement de votre réponse"
      >
        <div className="loading-monogram" aria-hidden="true">
          C<span>&amp;</span>D
        </div>
        <div className="loading-line" aria-hidden="true" />
        <p>Nous retrouvons votre réponse…</p>
        <p lang="he" dir="rtl">
          אנחנו מאתרים את תשובתכם…
        </p>
      </main>
    );
  }

  if (!isInvitationOpen) {
    return (
      <OpeningCard
        onDiscover={() => {
          window.scrollTo(0, 0);
          setIsInvitationOpen(true);
        }}
      />
    );
  }

  return (
    <main
      className="invitation-page"
      lang={language}
      dir={direction}
      data-language={language}
    >
      <div
        className="invitation-language-switcher"
        role="group"
        aria-label={t.languageLabel}
        dir="ltr"
      >
        <button
          type="button"
          aria-pressed={language === "fr"}
          onClick={() => setLanguage("fr")}
        >
          FR
        </button>
        <span aria-hidden="true" />
        <button
          type="button"
          aria-pressed={language === "he"}
          onClick={() => setLanguage("he")}
        >
          עברית
        </button>
      </div>

      <EventSections
        events={invitedEvents}
        language={language}
        settings={settings}
      />

      {settings.rsvpEnabled && (
        <RSVPForm
          events={invitedEvents}
          guest={guest}
          language={language}
          settings={settings}
          token={token}
          isGlobalInvitation={isGlobalInvitation}
        />
      )}
    </main>
  );
}
