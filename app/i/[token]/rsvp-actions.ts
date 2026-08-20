"use server";

import { revalidatePath } from "next/cache";
import {
  BaserowRequestError,
  getBaserowConfigurationStatus,
  updateGuestRSVP,
} from "@/lib/baserow";
import { getInvitationByToken } from "@/lib/invitation";
import { getInvitationAudience } from "@/lib/guest-display-name";
import { isValidPublicToken } from "@/lib/invitation-tokens";
import type {
  EventKey,
  RsvpStatus,
  ShuttleCity,
} from "@/lib/types";
import { SHUTTLE_CITIES } from "@/lib/types";

export interface RsvpSubmission {
  token: string;
  people: Array<{
    id: string;
    responses: Partial<Record<EventKey, RsvpStatus>>;
  }>;
  guestsCount: number;
  shuttleInterest: ShuttleCity[];
  message: string;
}

export type RsvpActionResult =
  | { ok: true; persisted: boolean }
  | { ok: false; error: "invalid" | "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseResponses(
  value: unknown,
): Partial<Record<EventKey, RsvpStatus>> | null {
  if (!isRecord(value)) {
    return null;
  }

  const responses: Partial<Record<EventKey, RsvpStatus>> = {};

  for (const [key, status] of Object.entries(value)) {
    if (
      !["wedding", "henna", "shabbat"].includes(key) ||
      !["yes", "no"].includes(String(status))
    ) {
      return null;
    }

    responses[key as EventKey] = status as RsvpStatus;
  }

  return responses;
}

function parseSubmission(value: unknown): RsvpSubmission | null {
  if (!isRecord(value)) {
    return null;
  }

  const people = Array.isArray(value.people)
    ? value.people.flatMap((candidate) => {
        if (!isRecord(candidate) || typeof candidate.id !== "string") {
          return [];
        }

        const responses = parseResponses(candidate.responses);

        if (
          !responses ||
          !/^(?:primary|secondary|member:\d+)$/.test(candidate.id)
        ) {
          return [];
        }

        return [{ id: candidate.id, responses }];
      })
    : [];

  if (
    !Array.isArray(value.people) ||
    people.length !== value.people.length ||
    people.length === 0 ||
    people.length > 100 ||
    new Set(people.map((person) => person.id)).size !== people.length ||
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
    value.message.length > 600
  ) {
    return null;
  }

  return {
    token: value.token,
    people,
    guestsCount: value.guestsCount,
    shuttleInterest: value.shuttleInterest as ShuttleCity[],
    message: value.message,
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
    const { rsvpPeople } = getInvitationAudience(
      invitation.guest,
      invitation.guestMembers,
    );
    const submittedById = new Map(
      input.people.map((person) => [person.id, person]),
    );

    if (
      expectedEventKeys.length === 0 ||
      submittedById.size !== rsvpPeople.length ||
      rsvpPeople.some((expectedPerson) => {
        const submittedPerson = submittedById.get(expectedPerson.id);

        if (!submittedPerson) {
          return true;
        }

        const submittedEventKeys = Object.keys(
          submittedPerson.responses,
        ) as EventKey[];

        return (
          submittedEventKeys.length !== expectedEventKeys.length ||
          expectedEventKeys.some(
            (eventKey) =>
              submittedPerson.responses[eventKey] !== "yes" &&
              submittedPerson.responses[eventKey] !== "no",
          )
        );
      }) ||
      input.guestsCount < 1 ||
      input.guestsCount > invitation.guest.maxGuests
    ) {
      return { ok: false, error: "invalid" };
    }

    if (configurationStatus === "unconfigured") {
      return process.env.NODE_ENV === "development"
        ? { ok: true, persisted: false }
        : { ok: false, error: "unavailable" };
    }

    await updateGuestRSVP({
      ...input,
      guestMembers: invitation.guestMembers,
    });
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
