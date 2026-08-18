import { formatEventDate, formatEventTime } from "@/lib/invitation-utils";
import { getTranslations } from "@/lib/translations";
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

interface EventPresentation {
  address: string;
  date: string;
  dateTime: string;
  hebrewDate?: string;
  highlights: readonly string[];
  introduction: string;
  time: string;
  title: string;
  venue: string;
}

function createWazeNavigationUrl(destination: string) {
  const params = new URLSearchParams({
    q: destination,
    navigate: "yes",
    utm_source: "clara_david_invitation",
  });

  return `https://www.waze.com/ul?${params.toString()}`;
}

function resolveWazeNavigationUrl(
  configuredUrl: string | null,
  fallbackUrl: string,
) {
  if (!configuredUrl) {
    return fallbackUrl;
  }

  try {
    const url = new URL(configuredUrl);
    const isTemporaryDriveShare =
      url.hostname.endsWith("waze.com") &&
      url.searchParams.get("a") === "share_drive";

    return isTemporaryDriveShare ? fallbackUrl : configuredUrl;
  } catch {
    return fallbackUrl;
  }
}

const WAZE_FALLBACKS: Record<EventKey, string> = {
  wedding: createWazeNavigationUrl(
    "58 FIFTY EIGHT, HaYarkonim 58, Petah Tikva, Israel",
  ),
  henna: createWazeNavigationUrl(
    "Narya House - נאריה האוס, HaHarash Street, Petah Tikva, Israel",
  ),
  shabbat: createWazeNavigationUrl("Kibbutz Almog, Israel"),
};

const UI_COPY = {
  fr: {
    labels: {
      date: "Date",
      time: "Horaire",
      venue: "Lieu",
    },
    menu: "Retour au menu",
  },
  he: {
    labels: {
      date: "תאריך",
      time: "שעה",
      venue: "מקום",
    },
    menu: "חזרה לתפריט",
  },
} as const;

const EVENT_COPY = {
  wedding: {
    fr: {
      title: "Houppa",
      introduction: "Nous serions heureux de vous compter parmi nous pour célébrer notre union.",
      date: "Lundi 2 novembre 2026",
      hebrewDate: "כ״ב בְּחֶשְׁוָן תשפ״ז",
      time: "18h00 précises",
      venue: "Salle 58",
      address: "HaYarkonim 58, Petah Tikva, Israël",
      highlights: [
        "La cérémonie sera suivie d’une réception.",
        "Nous avons une pensée très émue pour nos grands-parents,",
        "Monsieur Abecassis, Rene Bourak, Mady Zerbib",
      ],
    },
    he: {
      title: "חופה",
      introduction: "נשמח לחגוג את נישואינו יחד איתכם.",
      date: "יום שני, 2 בנובמבר 2026",
      hebrewDate: "כ״ב בְּחֶשְׁוָן תשפ״ז",
      time: "18:00 בדיוק",
      venue: "אולם 58",
      address: "הירקונים 58, פתח תקווה, ישראל",
      highlights: [
        "לאחר החופה תתקיים קבלת פנים.",
        "במחשבותינו הנרגשות נמצאים סבינו וסבותינו,",
        "Monsieur Abecassis, Rene Bourak, Mady Zerbib",
      ],
    },
  },
  henna: {
    fr: {
      title: "Henné",
      introduction: "Une soirée chaleureuse et joyeuse pour ouvrir les festivités.",
      venue: "Narya House",
      address: "Petah Tikva, Israël",
      highlights: ["Tenue blanche exigée."],
    },
    he: {
      title: "חינה",
      introduction: "ערב חם ושמח לפתיחת החגיגות.",
      venue: "Narya House",
      address: "פתח תקווה, ישראל",
      highlights: ["לבוש לבן חובה."],
    },
  },
  shabbat: {
    fr: {
      title: "Shabbat Hatan",
      introduction: "Nous avons la joie de partager avec vous la simha de notre Shabbat Hatan.",
      date: "Vendredi 6 & samedi 7 novembre 2026",
      time: "Entrée 16h27 · Sortie 17h25",
      venue: "Kibboutz Almog",
      address: "Almog, Israël",
      highlights: [
        "Les offices seront suivis d’un repas.",
        "Paracha ‘Hayé Sarah",
      ],
    },
    he: {
      title: "שבת חתן",
      introduction: "נשמח לחלוק עמכם את שמחת שבת החתן שלנו.",
      date: "יום שישי 6 ושבת 7 בנובמבר 2026",
      time: "כניסה 16:27 · יציאה 17:25",
      venue: "קיבוץ אלמוג",
      address: "אלמוג, ישראל",
      highlights: [
        "לאחר התפילות תתקיים סעודה.",
        "פרשת חיי שרה",
      ],
    },
  },
} as const;

function getPresentation(
  event: WeddingEvent,
  language: Language,
): EventPresentation {
  if (event.key === "wedding") {
    const copy = EVENT_COPY.wedding[language];

    return {
      ...copy,
      dateTime: "2026-11-02T18:00:00+02:00",
    };
  }

  if (event.key === "henna") {
    const copy = EVENT_COPY.henna[language];

    return {
      ...copy,
      address: event.address[language] || copy.address,
      date: formatEventDate(event.date, language),
      dateTime: event.date,
      time: formatEventTime(event.date, language),
    };
  }

  const copy = EVENT_COPY.shabbat[language];

  return {
    ...copy,
    address: event.address[language] || copy.address,
    dateTime: "2026-11-06",
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

export function FramedEventInvitation({
  event,
  language,
  settings,
}: FramedEventInvitationProps) {
  const presentation = getPresentation(event, language);
  const ui = UI_COPY[language];
  const t = getTranslations(language).events;
  const titleId = `framed-event-title-${event.key}`;
  const wazeUrl = resolveWazeNavigationUrl(
    event.wazeUrl,
    WAZE_FALLBACKS[event.key],
  );
  return (
    <article
      id={`event-${event.key}`}
      className="framed-event-page simple-event-slide"
      data-event={event.key}
      aria-labelledby={titleId}
    >
      <div className="simple-event-content">
        <header className="simple-event-header">
          <h2 id={titleId}>{presentation.title}</h2>

          {event.key === "wedding" ? (
            <div className="simple-event-wedding-families">
              <div className="simple-event-family">
                <div className="simple-event-family-lines">
                  <p>M. et Mme Johan et Valerie Amsellem</p>
                  <p>M. et Mme Armand et Aline Amsellem</p>
                  <p>Mme Paule Abecassis</p>
                </div>
                <p className="simple-event-person-name">
                  <span>{settings.brideName}</span>
                  <small lang="he" dir="rtl">קלרה</small>
                </p>
              </div>

              <i className="simple-event-couple-ampersand" aria-hidden="true">
                &amp;
              </i>

              <div className="simple-event-family">
                <div className="simple-event-family-lines">
                  <p>M. et Mme Serge et Fabienne Bourak</p>
                  <p>Mme Jeanine Bourak</p>
                  <p>M. Armand Zerbib</p>
                </div>
                <p className="simple-event-person-name">
                  <span>{settings.groomName}</span>
                  <small lang="he" dir="rtl">דוד</small>
                </p>
              </div>
            </div>
          ) : null}

          <span className="simple-event-ornament" aria-hidden="true" />
        </header>

        <p className="simple-event-introduction">
          {presentation.introduction}
        </p>

        <div className="simple-event-details">
          <div>
            <span>{ui.labels.date}</span>
            <time dateTime={presentation.dateTime}>{presentation.date}</time>
            {presentation.hebrewDate && (
              <small className="simple-event-hebrew-date" lang="he" dir="rtl">
                {presentation.hebrewDate}
              </small>
            )}
          </div>
          <div>
            <span>{ui.labels.time}</span>
            <strong>{presentation.time}</strong>
          </div>
          <div>
            <span>{ui.labels.venue}</span>
            <strong>{presentation.venue}</strong>
            <address>{presentation.address}</address>
          </div>
        </div>

        <div className="simple-event-actions">
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="simple-event-action focus-ring"
          >
            <PinIcon />
            <span>{t.waze}</span>
          </a>
        </div>

        <div className="simple-event-highlights">
          {presentation.highlights.map((highlight) => (
            <p key={highlight}>{highlight}</p>
          ))}
        </div>

        <a href="#introduction" className="simple-event-menu-link focus-ring">
          {ui.menu}
        </a>
      </div>
    </article>
  );
}
