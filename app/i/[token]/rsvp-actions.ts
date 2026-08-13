"use server";

import { revalidatePath } from "next/cache";
import {
  BaserowRequestError,
  createGuestRSVP,
  getBaserowConfigurationStatus,
  updateGuestRSVP,
} from "@/lib/baserow";
import { getInvitationByToken } from "@/lib/invitation";
import {
  isGlobalInvitationToken,
  isValidPublicToken,
} from "@/lib/invitation-tokens";
import type {
  EventKey,
  Language,
  RsvpStatus,
  ShuttleCity,
} from "@/lib/types";
import { SHUTTLE_CITIES } from "@/lib/types";

export interface RsvpSubmission {
  token: string;
  responses: Partial<Record<EventKey, RsvpStatus>>;
  guestsCount: number;
  shuttleInterest: ShuttleCity[];
  message: string;
  firstName: string;
  lastName: string;
  language: Language;
}

export type RsvpActionResult =
  | { ok: true; persisted: boolean; invitationToken?: string }
  | { ok: false; error: "invalid" | "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSubmission(value: unknown): RsvpSubmission | null {
  if (!isRecord(value) || !isRecord(value.responses)) {
    return null;
  }

  if (
    typeof value.token !== "string" ||
    !isValidPublicToken(value.token) ||
    typeof value.guestsCount !== "number" ||
    !Number.isInteger(value.guestsCount) ||
    !Array.isArray(value.shuttleInterest) ||
    value.shuttleInterest.length > SHUTTLE_CITIES.length ||
    value.shuttleInterest.some(
      (city) =>
        typeof city !== "string" ||
        !SHUTTLE_CITIES.includes(city as ShuttleCity),
    ) ||
    new Set(value.shuttleInterest).size !== value.shuttleInterest.length ||
    typeof value.message !== "string" ||
    value.message.length > 600 ||
    typeof value.firstName !== "string" ||
    value.firstName.length > 80 ||
    typeof value.lastName !== "string" ||
    value.lastName.length > 80 ||
    (value.language !== "fr" && value.language !== "he")
  ) {
    return null;
  }

  const responses: Partial<Record<EventKey, RsvpStatus>> = {};

  for (const [key, status] of Object.entries(value.responses)) {
    if (
      !["wedding", "henna", "shabbat"].includes(key) ||
      !["yes", "no"].includes(String(status))
    ) {
      return null;
    }

    responses[key as EventKey] = status as RsvpStatus;
  }

  return {
    token: value.token,
    responses,
    guestsCount: value.guestsCount,
    shuttleInterest: value.shuttleInterest as ShuttleCity[],
    message: value.message,
    firstName: value.firstName.trim(),
    lastName: value.lastName.trim(),
    language: value.language,
  };
}

export async function submitRsvp(
  value: unknown,
): Promise<RsvpActionResult> {
  const input = parseSubmission(value);

  if (!input) {
    return { ok: false, error: "invalid" };
  }

  try {
    const configurationStatus = getBaserowConfigurationStatus();

    if (configurationStatus === "partial") {
      return { ok: false, error: "unavailable" };
    }

    const invitation = await getInvitationByToken(input.token);

    if (!invitation) {
      return { ok: false, error: "invalid" };
    }

    const expectedEventKeys = invitation.events.map((event) => event.key);
    const submittedEventKeys = Object.keys(input.responses) as EventKey[];
    const isGlobalInvitation = isGlobalInvitationToken(input.token);

    if (
      expectedEventKeys.length === 0 ||
      expectedEventKeys.length !== submittedEventKeys.length ||
      expectedEventKeys.some(
        (eventKey) =>
          input.responses[eventKey] !== "yes" &&
          input.responses[eventKey] !== "no",
      ) ||
      input.guestsCount < 1 ||
      input.guestsCount > invitation.guest.maxGuests ||
      (isGlobalInvitation && (!input.firstName || !input.lastName))
    ) {
      return { ok: false, error: "invalid" };
    }

    if (configurationStatus === "unconfigured") {
      return process.env.NODE_ENV === "development"
        ? { ok: true, persisted: false }
        : { ok: false, error: "unavailable" };
    }

    if (isGlobalInvitation) {
      const created = await createGuestRSVP({
        ...input,
        preferredLanguage: input.language,
        invited: invitation.guest.invited,
        maxGuests: invitation.guest.maxGuests,
      });
      revalidatePath(`/i/${created.token}`);

      return {
        ok: true,
        persisted: true,
        invitationToken: created.token,
      };
    }

    await updateGuestRSVP(input);
    revalidatePath(`/i/${input.token}`);

    return { ok: true, persisted: true };
  } catch (error) {
    const status =
      error instanceof BaserowRequestError ? error.status : undefined;
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[RSVP] Enregistrement impossible", { name, status });

    return { ok: false, error: "unavailable" };
  }
}
