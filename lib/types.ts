export const EVENT_KEYS = ["wedding", "henna", "shabbat"] as const;

export type EventKey = (typeof EVENT_KEYS)[number];
export type Language = "fr" | "he";
export type LocalizedText = Record<Language, string>;
export type RsvpStatus = "pending" | "yes" | "no";
export const SHUTTLE_CITIES = ["Jerusalem", "Tel Aviv"] as const;
export type ShuttleCity = (typeof SHUTTLE_CITIES)[number];

export interface Guest {
  firstName: string;
  lastName: string;
  preferredLanguage: Language;
  invited: Record<EventKey, boolean>;
  maxGuests: number;
  rsvp: Record<EventKey, RsvpStatus>;
  rsvpSecond: Record<EventKey, RsvpStatus>;
  guestsCount: number;
  shuttleInterest: ShuttleCity[];
  message: string;
  answeredAt: string | null;
}

export interface WeddingEvent {
  key: EventKey;
  title: LocalizedText;
  date: string;
  venue: LocalizedText;
  address: LocalizedText;
  wazeUrl: string | null;
  googleMapsUrl: string | null;
  visible: boolean;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: LocalizedText;
  order: number;
  visible: boolean;
  section: string;
  width: number;
  height: number;
  focalPoint?: string;
}

export interface WeddingSettings {
  brideName: string;
  groomName: string;
  welcome: LocalizedText;
  heroImage: string;
  finalMessage: LocalizedText;
  contactPhone: string;
  rsvpEnabled: boolean;
}

export interface InvitationData {
  guest: Guest;
  events: WeddingEvent[];
  gallery: GalleryImage[];
  settings: WeddingSettings;
}
