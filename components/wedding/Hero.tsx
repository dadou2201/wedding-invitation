import Image from "next/image";
import { formatEventDate } from "@/lib/invitation-utils";
import { getTranslations } from "@/lib/translations";
import type { Language, WeddingSettings } from "@/lib/types";

interface HeroProps {
  language: Language;
  settings: WeddingSettings;
  weddingDate?: string;
  onLanguageChange: (language: Language) => void;
}

export function Hero({
  language,
  settings,
  weddingDate,
  onLanguageChange,
}: HeroProps) {
  const t = getTranslations(language);

  return (
    <header id="top" className="wedding-hero">
      <div className="wedding-hero__photo">
        <Image
          src={settings.heroImage}
          alt={`${settings.brideName} & ${settings.groomName}`}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 1px"
          className="wedding-hero__image wedding-hero__image--mobile"
        />
        <div className="wedding-hero__veil" aria-hidden="true" />

        <div className="wedding-hero__topbar">
          <div
            className="language-switcher"
            role="group"
            aria-label={t.languageLabel}
            dir="ltr"
          >
            <button
              type="button"
              className="focus-ring"
              aria-pressed={language === "fr"}
              onClick={() => onLanguageChange("fr")}
            >
              FR
            </button>
            <span aria-hidden="true" />
            <button
              type="button"
              className="focus-ring"
              aria-pressed={language === "he"}
              onClick={() => onLanguageChange("he")}
            >
              עברית
            </button>
          </div>
        </div>

        <div className="intro-card">
          <div className="intro-card__inner">
            <div
              className="intro-logo"
              role="img"
              aria-label={`Logo ${settings.brideName} & ${settings.groomName}`}
              dir="ltr"
            />

            <p className="intro-card__invitation">
              {t.hero.invitation}
            </p>

            <h1 className="hero-names" dir="ltr">
              <span>{settings.brideName}</span>
              <span className="hero-ampersand">&amp;</span>
              <span>{settings.groomName}</span>
            </h1>

            {weddingDate && (
              <time dateTime={weddingDate} className="hero-date">
                {formatEventDate(weddingDate, language)}
              </time>
            )}

            <a
              href="#invitation"
              className="hero-discover-button focus-ring"
            >
              {t.hero.discover}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
