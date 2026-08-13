import Image from "next/image";
import {
  createCalendarDataUri,
  formatEventTime,
} from "@/lib/invitation-utils";
import { getTranslations, localeByLanguage } from "@/lib/translations";
import type {
  EventKey,
  Language,
  WeddingEvent,
  WeddingSettings,
} from "@/lib/types";

interface FramedEventInvitationProps {
  event: WeddingEvent;
  language: Language;
  settings: WeddingSettings;
}

interface DateParts {
  weekday: string;
  day: string;
  month: string;
  year: string;
}

const EVENT_BACKGROUNDS: Record<EventKey, string> = {
  wedding: "/images/nous4.jpg",
  henna: "/images/nous3.jpg",
  shabbat: "/images/nous5.jpg",
};

const WEDDING_WAZE_URL =
  "https://waze.com/ul?a=share_drive&locale=fr&sd=k1s7LFSZJFFgApmWOg-sd&env=il&utm_source=waze_app&utm_campaign=share_drive";

const HENNA_WAZE_URL =
  "https://waze.com/ul?a=share_drive&locale=fr&sd=DE71hT8-3dug-Wm7fQ-sd&env=il&utm_source=waze_app&utm_campaign=share_drive";

const SHABBAT_WAZE_URL =
  "https://waze.com/ul?a=share_drive&locale=fr&sd=Mo3PIkAzaFmZZFEmdw-sd&env=il&utm_source=waze_app&utm_campaign=share_drive";

const WEDDING_COPY = {
  fr: {
    heading: "Houppa",
    invitation:
      "Seraient honorés de votre présence à la houppa qui sera célébrée le",
    civilDate: "Lundi 2 novembre 2026",
    time: "à 18h00 précises",
    address: "Salle 58, Petah Tikva, Israël",
    reception: "La cérémonie sera suivie d’une réception",
    memorial:
      "Nous avons une pensée très émue pour nos grands-pères, M. Abecassis et M. Bourak.",
    route: "Itinéraire",
  },
  he: {
    heading: "חופה",
    invitation: "נשמח לכבד אתכם בנוכחותכם בחופה שתתקיים ביום",
    civilDate: "יום שני, 2 בנובמבר 2026",
    time: "בשעה 18:00 בדיוק",
    address: "אולם 58, פתח תקווה, ישראל",
    reception: "לאחר החופה תתקיים קבלת פנים",
    memorial:
      "בהתרגשות אנו זוכרים את הסבים שלנו, מר אבקסיס ומר בוראק.",
    route: "מסלול",
  },
} as const;

const HENNA_COPY = {
  fr: {
    heading: "Henné",
    invitation: "Une soirée chaleureuse et joyeuse à la villa Narya House",
    dressCode: "Tenue blanche exigée",
    route: "Itinéraire",
  },
  he: {
    heading: "חינה",
    invitation: "ערב חם ושמח בווילה Narya House",
    dressCode: "לבוש לבן חובה",
    route: "מסלול",
  },
} as const;

const SHABBAT_COPY = {
  fr: {
    heading: "Shabbat Hatan",
    introduction:
      "C’est avec une grande reconnaissance envers Hachem, que nous avons la joie de partager avec vous la simha de notre Shabbat Hatan qui aura lieu le",
    firstDateLine: "Vendredi 6 &",
    secondDateLine: "Samedi 7 novembre 2026",
    venue: "Kibboutz Almog",
    meal: "Les offices seront suivis d’un repas.",
    hoursHeading: "Horaires de Shabbat",
    hours: "E : 16h27 – S : 17h25",
    parasha: "Paracha ‘Hayé Sarah",
    route: "Itinéraire",
  },
  he: {
    heading: "שבת חתן",
    introduction:
      "בהודיה גדולה לה׳, אנו שמחים להזמין אתכם לחלוק עמנו את שמחת שבת החתן שתתקיים ב־",
    firstDateLine: "יום שישי 6 ו־",
    secondDateLine: "שבת 7 בנובמבר 2026",
    venue: "קיבוץ אלמוג",
    meal: "לאחר התפילות תתקיים סעודה.",
    hoursHeading: "זמני שבת",
    hours: "כניסת שבת: 16:27 · צאת שבת: 17:25",
    parasha: "פרשת חיי שרה",
    route: "מסלול",
  },
} as const;

function formatDateParts(date: string, language: Language): DateParts {
  const value = new Date(date);
  const locale = localeByLanguage[language];
  const options = { timeZone: "Asia/Jerusalem" } as const;

  return {
    weekday: new Intl.DateTimeFormat(locale, {
      ...options,
      weekday: "long",
    }).format(value),
    day: new Intl.DateTimeFormat(locale, {
      ...options,
      day: "2-digit",
    }).format(value),
    month: new Intl.DateTimeFormat(locale, {
      ...options,
      month: "long",
    }).format(value),
    year: new Intl.DateTimeFormat(locale, {
      ...options,
      year: "numeric",
    }).format(value),
  };
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3v3m14-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function WeddingInvitation({
  event,
  language,
  settings,
}: FramedEventInvitationProps) {
  const copy = WEDDING_COPY[language];
  const t = getTranslations(language).events;
  const titleId = `framed-event-title-${event.key}`;

  return (
    <article
      id={`event-${event.key}`}
      className="framed-event-page framed-event-page--wedding"
      aria-labelledby={titleId}
    >
      <Image
        src={EVENT_BACKGROUNDS.wedding}
        alt="Clara et David"
        fill
        sizes="100vw"
        className="framed-event-page__background"
      />
      <span className="framed-event-page__veil" aria-hidden="true" />

      <div className="framed-event-card framed-event-card--wedding">
        <div className="framed-event-card__inner wedding-stationery">
          <div className="wedding-corner-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="wedding-bsd" lang="he" dir="rtl">
            בס״ד
          </p>

          <h2
            id={titleId}
            className="invitation-event-title wedding-ceremony-title"
          >
            {copy.heading}
          </h2>
          <p className="wedding-blessing" lang="he" dir="rtl">
            קול ששון וקול שמחה קול חתן וקול כלה
          </p>

          <div className="wedding-families" dir="ltr">
            <p>
              <span>Mme Abecassis</span>
              <span>M. et Mme Amsellem</span>
            </p>
            <p>
              <span>M. Zerbib</span>
              <span>Mme Bourak</span>
            </p>
          </div>

          <div className="wedding-couple" dir="ltr">
            <span>Clara</span>
            <i>&amp;</i>
            <span>David</span>
          </div>
          <p className="wedding-couple-hebrew" lang="he" dir="rtl">
            קלרה דוד
          </p>

          <p className="wedding-invitation-copy">{copy.invitation}</p>

          <div className="wedding-date-block">
            <time dateTime="2026-11-02T18:00:00+02:00">
              {copy.civilDate}
            </time>
            <span lang="he" dir="rtl">
              כ״ג חשוון ה׳תשפ״ז
            </span>
            <span>{copy.time}</span>
          </div>

          <address className="wedding-address">{copy.address}</address>
          <p className="wedding-reception">{copy.reception}</p>
          <p className="wedding-memorial">{copy.memorial}</p>

          <a
            href={WEDDING_WAZE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="wedding-route-button focus-ring"
          >
            <PinIcon />
            <span>{copy.route}</span>
          </a>

          <div className="wedding-secondary-actions">
            {event.googleMapsUrl && (
              <a
                href={event.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring"
              >
                {t.maps}
              </a>
            )}
            <a
              href={createCalendarDataUri(event, settings, language)}
              download={`${event.key}-${settings.brideName}-${settings.groomName}.ics`}
              className="focus-ring"
            >
              <CalendarIcon />
              <span>{t.calendar}</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function ShabbatInvitation({
  event,
  language,
}: FramedEventInvitationProps) {
  const copy = SHABBAT_COPY[language];
  const titleId = `framed-event-title-${event.key}`;

  return (
    <article
      id={`event-${event.key}`}
      className="framed-event-page framed-event-page--shabbat"
      aria-labelledby={titleId}
    >
      <Image
        src={EVENT_BACKGROUNDS.shabbat}
        alt={event.title[language]}
        fill
        sizes="100vw"
        className="framed-event-page__background"
      />
      <span className="framed-event-page__veil" aria-hidden="true" />

      <div className="framed-event-card framed-event-card--shabbat">
        <div className="framed-event-card__inner shabbat-stationery">
          <h2
            id={titleId}
            className="invitation-event-title shabbat-title"
          >
            {copy.heading}
          </h2>

          <p className="shabbat-introduction">{copy.introduction}</p>

          <time
            dateTime="2026-11-06"
            className="shabbat-date"
            dir={language === "he" ? "rtl" : "ltr"}
          >
            <span>{copy.firstDateLine}</span>
            <span>{copy.secondDateLine}</span>
          </time>

          <span className="shabbat-ornament" aria-hidden="true">
            ✹
          </span>

          <address className="shabbat-venue">{copy.venue}</address>
          <p className="shabbat-meal">{copy.meal}</p>

          <div className="shabbat-hours">
            <span>{copy.hoursHeading}</span>
            <strong dir={language === "he" ? "rtl" : "ltr"}>
              {copy.hours}
            </strong>
          </div>

          <span className="shabbat-ornament" aria-hidden="true">
            ✹
          </span>

          <p className="shabbat-parasha">{copy.parasha}</p>

          <a
            href={SHABBAT_WAZE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shabbat-route-button focus-ring"
          >
            <PinIcon />
            <span>{copy.route}</span>
          </a>
        </div>
      </div>
    </article>
  );
}

function HennaInvitation({
  event,
  language,
}: FramedEventInvitationProps) {
  const copy = HENNA_COPY[language];
  const date = formatDateParts(event.date, language);
  const titleId = `framed-event-title-${event.key}`;

  return (
    <article
      id={`event-${event.key}`}
      className="framed-event-page framed-event-page--henna"
      aria-labelledby={titleId}
    >
      <Image
        src={EVENT_BACKGROUNDS.henna}
        alt={event.title[language]}
        fill
        sizes="100vw"
        className="framed-event-page__background"
      />
      <span className="framed-event-page__veil" aria-hidden="true" />

      <div className="framed-event-card framed-event-card--henna">
        <div className="framed-event-card__inner henna-stationery">
          <h2
            id={titleId}
            className="invitation-event-title henna-title"
          >
            {copy.heading}
          </h2>

          <p className="henna-invitation-copy">{copy.invitation}</p>

          <div className="henna-monogram" aria-hidden="true">
            <Image
              src="/images/monogram-cd-white.png"
              alt=""
              fill
              sizes="160px"
              className="henna-monogram__image"
            />
          </div>

          <div className="henna-date-block">
            <time dateTime={event.date}>
              <span>{date.weekday}</span>
              <strong>{date.day}</strong>
              <span>{date.month}</span>
              <small>{date.year}</small>
            </time>
            <p>{formatEventTime(event.date, language)}</p>
          </div>

          <p className="henna-dress-code">{copy.dressCode}</p>

          <a
            href={HENNA_WAZE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="henna-route-button focus-ring"
          >
            <PinIcon />
            <span>{copy.route}</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function FramedEventInvitation(
  props: FramedEventInvitationProps,
) {
  return props.event.key === "wedding" ? (
    <WeddingInvitation {...props} />
  ) : props.event.key === "henna" ? (
    <HennaInvitation {...props} />
  ) : (
    <ShabbatInvitation {...props} />
  );
}
