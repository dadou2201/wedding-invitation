import type { EventKey, Language, RsvpStatus } from "@/lib/types";

const dictionary = {
  fr: {
    languageLabel: "Langue de l’invitation",
    hero: {
      eyebrow: "Nous nous marions",
      invitation:
        "Nous avons la joie de vous inviter à célébrer notre mariage",
      discover: "Découvrir",
    },
    welcome: {
      eyebrow: "Une invitation rien que pour vous",
      salutation: (firstName: string) => `${firstName},`,
    },
    countdown: {
      eyebrow: "Le grand jour approche",
      title: "Encore un peu de patience…",
      units: {
        days: "Jours",
        hours: "Heures",
        minutes: "Minutes",
      },
      complete: "Le grand jour est arrivé",
    },
    events: {
      eyebrow: "Au programme",
      title: "Célébrons ensemble",
      intros: {
        wedding: "Nous serions profondément heureux de vous compter parmi nous pour célébrer notre union.",
        henna: "Une soirée chaleureuse, colorée et joyeuse pour ouvrir les festivités entourés de ceux que nous aimons.",
        shabbat: "Prolongeons les célébrations autour d’un moment de partage, de lumière et de douceur.",
      } satisfies Record<EventKey, string>,
      venue: "Le lieu",
      waze: "Waze",
      maps: "Google Maps",
      calendar: "Ajouter au calendrier",
    },
    gallery: {
      eyebrow: "Notre histoire",
      title: "Quelques instants à deux",
      text: "Des souvenirs simples, baignés de soleil, avant d’écrire avec vous le plus beau chapitre.",
    },
    rsvp: {
      eyebrow: "Votre réponse",
      title: "Serez-vous des nôtres ?",
      intro: "",
      yes: "Sera présent",
      no: "Ne participera pas",
      pending: "En attente",
      guestCount: "Nombre de personnes",
      decreaseGuestCount: "Retirer une personne",
      increaseGuestCount: "Ajouter une personne",
      shuttleLabel: "Intéressé·e par une navette ?",
      shuttleHelp: "",
      shuttleJerusalem: "Jérusalem",
      shuttleTelAviv: "Tel Aviv",
      messageLabel: "Un petit mot pour les mariés",
      messageHelp: "Facultatif, mais toujours apprécié ♡",
      messagePlaceholder: "Écrivez-nous quelques mots…",
      submit: "Envoyer ma réponse",
      submitting: "Enregistrement…",
      required: "Merci de répondre pour chaque événement.",
      invalid: "Certaines informations sont incomplètes. Merci de vérifier vos réponses.",
      unavailable: "Nous n’avons pas pu enregistrer votre réponse. Merci de réessayer dans quelques instants.",
      storageNote: "Votre réponse est transmise directement aux mariés.",
      savedEyebrow: "Réponse enregistrée",
      savedTitle: (firstName: string) => `Merci ${firstName}`,
      savedText: "Votre réponse a bien été enregistrée.",
      savedNote: "Vous pourrez modifier votre réponse à tout moment depuis cette invitation.",
      developmentNote: "Mode développement : cette confirmation n’a pas été envoyée à Baserow.",
      edit: "Modifier ma réponse",
      summary: "Votre réponse",
      guestSummary: (count: number) =>
        count === 1 ? "1 personne" : `${count} personnes`,
      statuses: {
        pending: "En attente",
        yes: "Présent",
        no: "Absent",
      } satisfies Record<RsvpStatus, string>,
    },
    final: {
      eyebrow: "Avec toute notre affection",
    },
    footer: {
      backToTop: "Revenir en haut",
      signature: "Nous avons hâte de célébrer avec vous",
    },
  },
  he: {
    languageLabel: "שפת ההזמנה",
    hero: {
      eyebrow: "אנחנו מתחתנים",
      invitation: "בשמחה גדולה אנחנו מזמינים אתכם לחגוג איתנו את נישואינו",
      discover: "לגלות",
    },
    welcome: {
      eyebrow: "הזמנה אישית במיוחד בשבילך",
      salutation: (firstName: string) => `${firstName},`,
    },
    countdown: {
      eyebrow: "היום הגדול מתקרב",
      title: "עוד קצת סבלנות…",
      units: {
        days: "ימים",
        hours: "שעות",
        minutes: "דקות",
      },
      complete: "היום הגדול הגיע",
    },
    events: {
      eyebrow: "התוכנית שלנו",
      title: "חוגגים יחד",
      intros: {
        wedding: "נשמח מכל הלב לחגוג את האהבה שלנו יחד איתך ברגע המיוחד הזה.",
        henna: "ערב חם, צבעוני ושמח שיפתח את החגיגות יחד עם האנשים האהובים עלינו.",
        shabbat: "נמשיך את החגיגה ברגע של יחד, אור ושלווה סביב שולחן השבת.",
      } satisfies Record<EventKey, string>,
      venue: "המקום",
      waze: "Waze",
      maps: "Google Maps",
      calendar: "הוספה ליומן",
    },
    gallery: {
      eyebrow: "הסיפור שלנו",
      title: "כמה רגעים של שנינו",
      text: "זיכרונות פשוטים ומלאי שמש, לפני שנכתוב יחד איתכם את הפרק היפה ביותר.",
    },
    rsvp: {
      eyebrow: "אישור הגעה",
      title: "תחגגו איתנו?",
      intro: "",
      yes: "אגיע בשמחה",
      no: "לא אוכל להגיע",
      pending: "טרם נענה",
      guestCount: "מספר האורחים",
      decreaseGuestCount: "הסרת אורח",
      increaseGuestCount: "הוספת אורח",
      shuttleLabel: "מעוניינים בהסעה?",
      shuttleHelp: "",
      shuttleJerusalem: "ירושלים",
      shuttleTelAviv: "תל אביב",
      messageLabel: "כמה מילים לזוג",
      messageHelp: "לא חובה, אבל תמיד משמח ♡",
      messagePlaceholder: "כתבו לנו כמה מילים…",
      submit: "שליחת האישור",
      submitting: "שומרים…",
      required: "נא להשיב עבור כל אירוע.",
      invalid: "חלק מהמידע חסר או אינו תקין. אנא בדקו את התשובות.",
      unavailable: "לא הצלחנו לשמור את תשובתכם כרגע. אנא נסו שוב בעוד מספר רגעים.",
      storageNote: "התשובה נשלחת ישירות לזוג.",
      savedEyebrow: "התשובה נשמרה",
      savedTitle: (firstName: string) => `תודה ${firstName}`,
      savedText: "תשובתכם נשמרה בהצלחה.",
      savedNote: "תוכלו לחזור ולעדכן את התשובה בכל עת דרך ההזמנה הזו.",
      developmentNote: "מצב פיתוח: האישור מוצג אך לא נשלח ל-Baserow.",
      edit: "עריכת התשובה",
      summary: "התשובה שלך",
      guestSummary: (count: number) =>
        count === 1 ? "אורח אחד" : `${count} אורחים`,
      statuses: {
        pending: "טרם נענה",
        yes: "מגיעים",
        no: "לא מגיעים",
      } satisfies Record<RsvpStatus, string>,
    },
    final: {
      eyebrow: "באהבה גדולה",
    },
    footer: {
      backToTop: "חזרה למעלה",
      signature: "מחכים לחגוג איתכם",
    },
  },
} as const;

export function getTranslations(language: Language) {
  return dictionary[language];
}

export const localeByLanguage: Record<Language, string> = {
  fr: "fr-FR",
  he: "he-IL",
};
