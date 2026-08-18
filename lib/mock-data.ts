import type {
  GalleryImage,
  Guest,
  InvitationData,
  WeddingEvent,
  WeddingSettings,
} from "@/lib/types";

interface MockGuestRecord extends Guest {
  token: string;
  lastName: string;
}

export const mockSettings: WeddingSettings = {
  brideName: "Clara",
  groomName: "David",
  welcome: {
    fr: "C’est avec une immense joie que nous vous invitons à partager les jours qui entoureront notre mariage. Votre présence donnera à cette histoire une lumière toute particulière.",
    he: "בשמחה גדולה אנחנו מזמינים אתכם לקחת חלק בימים המיוחדים שסביב החתונה שלנו. הנוכחות שלכם תוסיף לסיפור הזה אור שאין לו תחליף.",
  },
  heroImage: "/images/hero.jpg",
  finalMessage: {
    fr: "Il y a des bonheurs qui ne prennent tout leur sens que lorsqu’ils sont partagés. Merci de faire partie du nôtre.",
    he: "יש רגעים של אושר שמקבלים משמעות אמיתית רק כשחולקים אותם. תודה שאתם חלק מהאושר שלנו.",
  },
  contactPhone: "+972500000000",
  rsvpEnabled: true,
};

export const mockEvents: WeddingEvent[] = [
  {
    key: "henna",
    title: { fr: "La soirée du henné", he: "ערב החינה" },
    date: "2027-06-10T19:30:00+03:00",
    venue: { fr: "La Maison des Oliviers", he: "בית הזיתים" },
    address: {
      fr: "12, chemin des Oliviers · Jérusalem",
      he: "דרך הזיתים 12 · ירושלים",
    },
    wazeUrl:
      "https://www.waze.com/ul?q=Jerusalem&navigate=yes",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jerusalem",
    visible: true,
  },
  {
    key: "wedding",
    title: { fr: "Notre mariage", he: "החתונה שלנו" },
    date: "2027-06-15T18:30:00+03:00",
    venue: { fr: "Le Jardin de Jérusalem", he: "הגן הירושלמי" },
    address: {
      fr: "8, promenade de la Paix · Jérusalem",
      he: "טיילת השלום 8 · ירושלים",
    },
    wazeUrl:
      "https://www.waze.com/ul?q=Jerusalem&navigate=yes",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jerusalem",
    visible: true,
  },
  {
    key: "shabbat",
    title: { fr: "Le Chabbat", he: "שבת חתן" },
    date: "2027-06-18T19:00:00+03:00",
    venue: { fr: "La Cour de David", he: "חצר דוד" },
    address: {
      fr: "4, rue de la Citadelle · Jérusalem",
      he: "רחוב המצודה 4 · ירושלים",
    },
    wazeUrl: null,
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jerusalem",
    visible: true,
  },
];

export const mockGallery: GalleryImage[] = [
  {
    id: "hero",
    src: "/images/hero.jpg",
    alt: {
      fr: "Clara et David souriant ensemble dans un jardin",
      he: "קלרה ודוד מחייכים יחד בגן",
    },
    order: 1,
    visible: true,
    section: "gallery",
    width: 2316,
    height: 3088,
    focalPoint: "50% 58%",
  },
  {
    id: "nous-2",
    src: "/images/nous2.jpg",
    alt: {
      fr: "Clara et David enlacés au soleil",
      he: "קלרה ודוד מחובקים בשמש",
    },
    order: 2,
    visible: true,
    section: "gallery",
    width: 1536,
    height: 2048,
    focalPoint: "50% 42%",
  },
  {
    id: "nous-3",
    src: "/images/nous3.jpg",
    alt: {
      fr: "Clara et David partageant un café face aux pierres de Jérusalem",
      he: "קלרה ודוד שותים קפה מול אבני ירושלים",
    },
    order: 3,
    visible: true,
    section: "gallery",
    width: 2048,
    height: 1536,
    focalPoint: "50% 50%",
  },
];

const createGuest = (
  guest: Pick<MockGuestRecord, "token" | "firstName" | "lastName"> &
    Partial<Omit<MockGuestRecord, "token" | "firstName" | "lastName">>,
): MockGuestRecord => ({
  preferredLanguage: "fr",
  invited: { wedding: true, henna: true, shabbat: true },
  maxGuests: 2,
  rsvp: { wedding: "pending", henna: "pending", shabbat: "pending" },
  rsvpSecond: { wedding: "pending", henna: "pending", shabbat: "pending" },
  guestsCount: 1,
  shuttleInterest: [],
  message: "",
  answeredAt: null,
  ...guest,
});

const mockGuests: MockGuestRecord[] = [
  createGuest({
    token: "clara-david-demo",
    firstName: "Léa",
    lastName: "Cohen",
  }),
  createGuest({
    token: "hebrew-demo",
    firstName: "נועה",
    lastName: "לוי",
    preferredLanguage: "he",
    maxGuests: 3,
  }),
  createGuest({
    token: "wedding-only",
    firstName: "Emma",
    lastName: "Benhamou",
    invited: { wedding: true, henna: false, shabbat: false },
    maxGuests: 1,
  }),
  createGuest({
    token: "wedding-henna",
    firstName: "Nathan",
    lastName: "Azoulay",
    invited: { wedding: true, henna: true, shabbat: false },
    maxGuests: 5,
  }),
  createGuest({
    token: "rsvp-saved",
    firstName: "Sarah",
    lastName: "Attal",
    rsvp: { wedding: "yes", henna: "no", shabbat: "yes" },
    rsvpSecond: { wedding: "yes", henna: "no", shabbat: "yes" },
    guestsCount: 2,
    shuttleInterest: ["Jerusalem"],
    message: "Nous avons très hâte de célébrer avec vous !",
    answeredAt: "2026-08-10T12:00:00+03:00",
  }),
];

export const mockInvitationTokens = mockGuests.map(({ token }) => token);

function toPublicGuest(guest: MockGuestRecord): Guest {
  return {
    firstName: guest.firstName,
    lastName: guest.lastName,
    preferredLanguage: guest.preferredLanguage,
    invited: guest.invited,
    maxGuests: guest.maxGuests,
    rsvp: guest.rsvp,
    rsvpSecond: guest.rsvpSecond,
    guestsCount: guest.guestsCount,
    shuttleInterest: guest.shuttleInterest,
    message: guest.message,
    answeredAt: guest.answeredAt,
  };
}

export function getMockInvitationByToken(
  token: string,
): InvitationData | null {
  const guest = mockGuests.find((candidate) => candidate.token === token);

  if (!guest) {
    return null;
  }

  return {
    guest: toPublicGuest(guest),
    events: mockEvents,
    gallery: mockGallery,
    settings: mockSettings,
  };
}
