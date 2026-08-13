import { localeByLanguage } from "@/lib/translations";
import type {
  EventKey,
  GalleryImage,
  Guest,
  Language,
  WeddingEvent,
  WeddingSettings,
} from "@/lib/types";

const EVENT_ORDER: Record<EventKey, number> = {
  wedding: 0,
  henna: 1,
  shabbat: 2,
};

export function getInvitedEvents(
  events: WeddingEvent[],
  guest: Guest,
): WeddingEvent[] {
  return events
    .filter((event) => event.visible && guest.invited[event.key])
    .sort((first, second) => EVENT_ORDER[first.key] - EVENT_ORDER[second.key]);
}

export function getVisibleGallery(images: GalleryImage[]): GalleryImage[] {
  return images
    .filter((image) => image.visible && image.section === "gallery")
    .sort((first, second) => first.order - second.order);
}

export function formatEventDate(date: string, language: Language): string {
  return new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(date));
}

export function formatEventTime(date: string, language: Language): string {
  return new Intl.DateTimeFormat(localeByLanguage[language], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(date));
}

function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function createCalendarDataUri(
  event: WeddingEvent,
  settings: WeddingSettings,
  language: Language,
): string {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const title = `${event.title[language]} — ${settings.brideName} & ${settings.groomName}`;
  const location = `${event.venue[language]}, ${event.address[language]}`;
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Clara & David//Wedding Invitation//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.key}-clara-david@wedding-invitation`,
    `DTSTAMP:${toIcsDate(start)}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`;
}
