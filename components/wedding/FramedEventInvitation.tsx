import Image from "next/image";
import fondHenne from "@/public/images/fondFinal.jpg";
import { getTranslations } from "@/lib/translations";
import type {
  Language,
  WeddingEvent,
  WeddingSettings,
} from "@/lib/types";

interface FramedEventInvitationProps {
  event: WeddingEvent;
  language: Language;
  settings: WeddingSettings;
}

const EVENT_COPY = {
  fr: {
    wedding: {
      title: "Houppa",
      joy: "Ont la joie de vous faire part du mariage de leurs enfants et petits-enfants",
      invitation:
        "Et seront honorés de votre présence à la houppa qui aura lieu le",
      date: "Lundi 2 Novembre",
      times: ["Cocktail 18h00", "Houppa 19h00"],
      venue: "Dans les salons 58",
      address: "Hayarkonim 58, Petah Tikva",
      memorial:
        "En ce jour si spécial, nous aurons une pensée émue pour nos grands-parents Yves Abécassis, René Bourak et Mady Zerbib",
    },
    henna: {
      title: "Henné",
      invitation:
        "Nous vous attendons tous en blanc pour prolonger les festivités lors de notre henné",
      date: "Le mercredi 4 novembre",
      time: "À 19:00",
      venue: "à Narya House, HaHarash, Petah Tikva",
    },
    shabbat: {
      title: "Chabbat Hatan",
      invitation:
        "Nous serons heureux de vous avoir à nos côtés pour partager la joie de notre chabbat hatan",
      date: "Le vendredi 6 novembre & samedi 7 novembre",
      venue: "Au Kfar Hanofesh Almog",
      address: "Kibboutz Almog",
      schedule: "Horaires de Chabbat",
      entrance: "E : 16h27",
      exit: "S : 17h25",
      parasha: "Parasha Haye Sarah",
    },
  },
  he: {
    wedding: {
      title: "חופה",
      joy: "שמחים לבשר על נישואי ילדיהם ונכדיהם",
      invitation: "ויתכבדו בנוכחותכם בחופה שתתקיים ביום",
      date: "יום שני, 2 בנובמבר",
      times: ["קבלת פנים 18:00", "חופה 19:00"],
      venue: "באולמי 58",
      address: "הירקונים 58, פתח תקווה",
      memorial:
        "ביום מיוחד זה נישא עמנו את זכר סבינו וסבותינו איב אבקסיס, רנה בורק ומדי זרביב",
    },
    henna: {
      title: "חינה",
      invitation: "נשמח לפגוש את כולכם בלבן ולהמשיך יחד את החגיגות בחינה שלנו",
      date: "יום רביעי, 4 בנובמבר",
      time: "בשעה 19:00",
      venue: "Narya House, רחוב החרש, פתח תקווה",
    },
    shabbat: {
      title: "שבת חתן",
      invitation: "נשמח שתהיו לצידנו ונחלוק יחד את שמחת שבת החתן שלנו",
      date: "יום שישי 6 בנובמבר ושבת 7 בנובמבר",
      venue: "כפר הנופש אלמוג",
      address: "קיבוץ אלמוג",
      schedule: "זמני שבת",
      entrance: "כניסה: 16:27",
      exit: "יציאה: 17:25",
      parasha: "פרשת חיי שרה",
    },
  },
} as const;

const WEDDING_FAMILIES = {
  left: [
    "Aline & Armand Amsellem",
    "Marie Paule Abécassis",
    "Valérie & Johan Amsellem",
  ],
  right: [
    "Armand Zerbib",
    "Jeanine Bourak",
    "Fabienne & Serge Bourak",
  ],
} as const;

const WEDDING_WAZE_FALLBACK =
  "https://www.waze.com/ul?q=58+FIFTY+EIGHT%2C+HaYarkonim+58%2C+Petah+Tikva%2C+Israel&navigate=yes&utm_source=clara_david_invitation";

const HENNA_WAZE_FALLBACK =
  "https://www.waze.com/ul?q=Narya+House%2C+HaHarash%2C+Petah+Tikva%2C+Israel&navigate=yes&utm_source=clara_david_invitation";

const SHABBAT_WAZE_FALLBACK =
  "https://www.waze.com/ul?q=Kfar+Hanofesh+Almog%2C+Kibboutz+Almog%2C+Israel&navigate=yes&utm_source=clara_david_invitation";

function BrandLogo({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`interior-brand${light ? " interior-brand--light" : ""}`}
    >
      <Image
        src="/images/logo2.jpg"
        alt="Logo Clara et David"
        width={1254}
        height={1254}
        sizes="(max-width: 480px) 112px, 144px"
      />
    </span>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function WazeLink({
  event,
  language,
}: {
  event: WeddingEvent;
  language: Language;
}) {
  const label = getTranslations(language).events.waze;
  const wazeUrl =
    event.wazeUrl ??
    (event.key === "wedding"
      ? WEDDING_WAZE_FALLBACK
      : event.key === "henna"
        ? HENNA_WAZE_FALLBACK
        : event.key === "shabbat"
          ? SHABBAT_WAZE_FALLBACK
          : null);

  if (!wazeUrl) {
    return null;
  }

  return (
    <a
      href={wazeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="interior-waze focus-ring"
      aria-label={`${label} — ${event.title[language]}`}
    >
      <PinIcon />
      <span>{label}</span>
    </a>
  );
}

function WeddingInvitation({
  event,
  language,
  settings,
}: FramedEventInvitationProps) {
  const copy = EVENT_COPY[language].wedding;

  return (
    <div className="interior-event__content wedding-invitation">
      <p className="wedding-bsd" lang="he" dir="rtl">
        בס״ד
      </p>
      <h2 id="wedding-title" className="interior-event__title">
        {copy.title}
      </h2>
      <p className="wedding-verse" lang="he" dir="rtl">
        קול ששון וקול שמחה קול חתן וקול כלה
      </p>

      <div className="wedding-families-new" dir="ltr">
        <div>
          {WEDDING_FAMILIES.left.map((name) => (
            <p key={name}>{name}</p>
          ))}
        </div>
        <div>
          {WEDDING_FAMILIES.right.map((name) => (
            <p key={name}>{name}</p>
          ))}
        </div>
      </div>

      <p className="wedding-joy">{copy.joy}</p>

      <div className="wedding-couple-new" dir="ltr">
        <div>
          <strong>{settings.brideName}</strong>
          <span lang="he" dir="rtl">חנה ביבה</span>
        </div>
        <i aria-hidden="true">&amp;</i>
        <div>
          <strong>{settings.groomName}</strong>
          <span lang="he" dir="rtl">ארמנד ברוך</span>
        </div>
      </div>

      <p className="wedding-invitation-text">{copy.invitation}</p>

      <div className="wedding-date-new">
        <time dateTime="2026-11-02">{copy.date}</time>
        <span lang="he" dir="rtl">כ״ג חשוון תשפ״ז</span>
        <div className="wedding-date-new__times">
          {copy.times.map((time) => (
            <strong key={time}>{time}</strong>
          ))}
        </div>
      </div>

      <address className="wedding-location-new">
        <strong>{copy.venue}</strong>
        <span>{copy.address}</span>
      </address>

      <p className="wedding-memorial-new">{copy.memorial}</p>
      <WazeLink event={event} language={language} />
    </div>
  );
}

function HennaInvitation({ event, language }: FramedEventInvitationProps) {
  const copy = EVENT_COPY[language].henna;
  const [venueName, ...venueAddressParts] = copy.venue.split(",");
  const venueAddress = venueAddressParts.join(",").trim();

  return (
    <div className="henna-frame">
      <svg
        className="henna-logo-filter"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="henna-logo-beige" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                0 0 0 0 0.290196
                0 0 0 0 0.227451
                0 0 0 0 0.192157
                -0.2126 -0.7152 -0.0722 0 1
              "
            />
          </filter>
        </defs>
      </svg>
      <Image
        src={fondHenne}
        alt=""
        fill
        sizes="100vw"
        className="henna-frame__artwork"
      />
      <div className="henna-frame__content">
        <h2 id="henna-title" className="henna-frame__title">
          {copy.title}
        </h2>
        <BrandLogo />
        <p className="henna-frame__intro">{copy.invitation}</p>
        <time dateTime="2026-11-04" className="henna-frame__date">
          {copy.date}
        </time>
        <strong className="henna-frame__time">{copy.time}</strong>
        <address className="henna-frame__venue">
          <span>{venueName.trim()}</span>
          {venueAddress && <span>{venueAddress}</span>}
        </address>
        <WazeLink event={event} language={language} />
      </div>
    </div>
  );
}

function ShabbatInvitation({ event, language }: FramedEventInvitationProps) {
  const copy = EVENT_COPY[language].shabbat;

  return (
    <div className="interior-event__content shabbat-invitation">
      <header className="shabbat-invitation__header">
        <h2 id="shabbat-title" className="interior-event__title">
          {copy.title}
        </h2>
        <p className="shabbat-invitation__intro">
          {language === "he" ? (
            <>
              <span>נשמח שתהיו לצידנו ונחלוק יחד</span>
              <span>את שמחת שבת החתן שלנו</span>
            </>
          ) : (
            copy.invitation
          )}
        </p>
      </header>

      <div className="shabbat-invitation__main">
        <time dateTime="2026-11-06" className="shabbat-invitation__date">
          {language === "fr" ? (
            <>
              <span>Vendredi 6 novembre</span>
              <i aria-hidden="true">&amp;</i>
              <span>Samedi 7 novembre</span>
            </>
          ) : (
            <>
              <span>יום שישי 6 בנובמבר</span>
              <i aria-hidden="true">&amp;</i>
              <span>שבת 7 בנובמבר</span>
            </>
          )}
        </time>
        <address className="shabbat-invitation__venue">
          <strong>{copy.venue}</strong>
          <span>{copy.address}</span>
        </address>
      </div>

      <div className="shabbat-invitation__footer">
        <div className="shabbat-schedule">
          <p>{copy.schedule}</p>
          <div>
            <span>{copy.entrance}</span>
            <span>{copy.exit}</span>
          </div>
        </div>
        <p className="shabbat-parasha-new">{copy.parasha}</p>
        <WazeLink event={event} language={language} />
      </div>
    </div>
  );
}

export function FramedEventInvitation(props: FramedEventInvitationProps) {
  const { event } = props;

  return (
    <article
      id={event.key}
      className={`interior-event interior-event--${event.key}`}
      aria-labelledby={`${event.key}-title`}
    >
      {event.key === "wedding" && <WeddingInvitation {...props} />}
      {event.key === "henna" && <HennaInvitation {...props} />}
      {event.key === "shabbat" && (
        <>
          <p className="wedding-bsd shabbat-bsd" lang="he" dir="rtl">
            בס״ד
          </p>
          <ShabbatInvitation {...props} />
        </>
      )}
    </article>
  );
}
