import type { Language, RsvpStatus } from "@/lib/types";

export const BASEROW_TABLES = {
  guests: "Guests",
  events: "Events",
  gallery: "Gallery",
  settings: "Settings",
} as const;

export const BASEROW_FIELDS = {
  guests: {
    token: "Token",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone",
    preferredLanguage: "Preferred Language",
    weddingInvited: "Wedding Invited",
    hennaInvited: "Henna Invited",
    shabbatInvited: "Shabbat Invited",
    maxGuests: "Max Guests",
    weddingRsvp: "Wedding RSVP",
    hennaRsvp: "Henna RSVP",
    shabbatRsvp: "Shabbat RSVP",
    weddingRsvpSecond: "Wedding RSVP 2",
    hennaRsvpSecond: "Henna RSVP 2",
    shabbatRsvpSecond: "Shabbat RSVP 2",
    guestsCount: "Guests Count",
    shuttleInterest: "Shuttle Interest",
    dietaryRequirements: "Dietary Requirements",
    message: "Message",
    answeredAt: "Answered At",
    side: "Side",
    tableNumber: "Table Number",
  },
  events: {
    name: "Nom",
    titleFr: "Title FR",
    titleHe: "Title HE",
    date: "Date",
    address: "Address",
    wazeUrl: "Waze URL",
    googleMapsUrl: "Google Maps URL",
    visible: "Visible",
  },
  gallery: {
    imageFile: "Image File",
    altFr: "Alt FR",
    altHe: "Alt HE",
    order: "Order",
    visible: "Visible",
    section: "Section",
  },
  settings: {
    groomName: "Groom Name",
    brideName: "Bride Name",
    welcomeFr: "Welcome FR",
    welcomeHe: "Welcome HE",
    heroImage: "Hero Image",
    finalMessageFr: "Final Message FR",
    finalMessageHe: "Final Message HE",
    contactPhone: "Contact Phone",
    rsvpEnabled: "RSVP Enabled",
  },
} as const;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeSelectionValues(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(normalizeSelectionValues);
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized ? [normalized] : [];
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (isRecord(value)) {
    for (const key of ["value", "name", "label", "text"]) {
      if (key in value) {
        const normalized = normalizeSelectionValues(value[key]);
        if (normalized.length > 0) {
          return normalized;
        }
      }
    }
  }

  return [];
}

export function normalizeSelectionValue(value: unknown): string {
  return normalizeSelectionValues(value)[0] ?? "";
}

export function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return normalizeSelectionValues(value).join(", ").trim();
}

export function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalized = normalizeSelectionValue(value).toLocaleLowerCase("en-US");

  if (["true", "1", "yes", "oui", "on", "checked", "כן"].includes(normalized)) {
    return true;
  }

  return false;
}

export function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const normalized = normalizeSelectionValue(value).replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeDate(value: unknown): string | null {
  const normalized = normalizeText(value);

  if (!normalized || Number.isNaN(Date.parse(normalized))) {
    return null;
  }

  return normalized;
}

export function normalizeLanguage(value: unknown): Language {
  const normalized = normalizeSelectionValue(value).toLocaleLowerCase("en-US");

  if (["he", "heb", "hebrew", "hébreu", "עברית"].includes(normalized)) {
    return "he";
  }

  return "fr";
}

export function normalizeRsvpStatus(value: unknown): RsvpStatus {
  const normalized = normalizeSelectionValue(value).toLocaleLowerCase("en-US");

  if (["yes", "oui", "present", "présent", "כן"].includes(normalized)) {
    return "yes";
  }

  if (["no", "non", "absent", "לא"].includes(normalized)) {
    return "no";
  }

  return "pending";
}

export function normalizeUrl(value: unknown): string | null {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function normalizeImageFileName(value: unknown): string | null {
  let candidate = value;

  if (Array.isArray(candidate)) {
    candidate = candidate[0];
  }

  if (isRecord(candidate)) {
    candidate =
      candidate.visible_name ?? candidate.name ?? candidate.value ?? candidate.label;
  }

  const normalized = normalizeText(candidate);

  if (
    !normalized ||
    normalized.includes("..") ||
    normalized.includes("/") ||
    normalized.includes("\\") ||
    !/^[\p{L}\p{N}][\p{L}\p{N} ._()-]*$/u.test(normalized)
  ) {
    return null;
  }

  return normalized;
}

export function toPublicImagePath(value: unknown): string | null {
  const fileName = normalizeImageFileName(value);
  return fileName ? `/images/${encodeURIComponent(fileName)}` : null;
}
