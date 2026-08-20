import type {
  GalleryImage,
  Guest,
  GuestMember,
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
    title: { fr: "Henné", he: "חינה" },
    date: "2026-11-04T19:00:00+02:00",
    venue: { fr: "Narya House", he: "Narya House" },
    address: {
      fr: "HaHarash, Petah Tikva",
      he: "רחוב החרש, פתח תקווה",
    },
    wazeUrl:
      "https://www.waze.com/ul?q=Narya+House%2C+HaHarash%2C+Petah+Tikva%2C+Israel&navigate=yes&utm_source=clara_david_invitation",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jerusalem",
    visible: true,
  },
  {
    key: "wedding",
    title: { fr: "Houppa", he: "חופה" },
    date: "2026-11-02T18:00:00+02:00",
    venue: { fr: "Les salons 58", he: "אולמי 58" },
    address: {
      fr: "Hayarkonim 58, Petah Tikva",
      he: "הירקונים 58, פתח תקווה",
    },
    wazeUrl:
      "https://www.waze.com/ul?q=Jerusalem&navigate=yes",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jerusalem",
    visible: true,
  },
  {
    key: "shabbat",
    title: { fr: "Chabbat Hatan", he: "שבת חתן" },
    date: "2026-11-06T16:27:00+02:00",
    venue: { fr: "Kfar Hanofesh Almog", he: "כפר הנופש אלמוג" },
    address: {
      fr: "Kibboutz Almog",
      he: "קיבוץ אלמוג",
    },
    wazeUrl:
      "https://www.waze.com/ul?q=Kfar+Hanofesh+Almog%2C+Kibboutz+Almog%2C+Israel&navigate=yes&utm_source=clara_david_invitation",
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
    token: "wedding-shabbat",
    firstName: "Myriam",
    lastName: "Dan",
    invited: { wedding: true, henna: false, shabbat: true },
    maxGuests: 2,
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
  createGuest({
    token: "family-demo",
    firstName: "Famille Bourak",
    lastName: "",
    maxGuests: 5,
  }),
];

const familyMemberNames = [
  "David Bourak",
  "Mickaël Bourak",
  "Fabienne Bourak",
  "Serge Bourak",
  "Liora Bourak",
];

const mockGuestMembersByToken: Record<string, GuestMember[]> = {
  "family-demo": familyMemberNames.map((name, index) => ({
    id: index + 1,
    name,
    rsvp: { wedding: "pending", henna: "pending", shabbat: "pending" },
  })),
};

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
    guestMembers: mockGuestMembersByToken[token] ?? [],
    events: mockEvents,
    gallery: mockGallery,
    settings: mockSettings,
  };
}
