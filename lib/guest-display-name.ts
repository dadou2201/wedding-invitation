import type { Guest, GuestMember, RsvpPerson } from "@/lib/types";

type GuestName = Pick<Guest, "firstName" | "lastName">;
type AudienceGuest = Pick<
  Guest,
  "firstName" | "lastName" | "rsvp" | "rsvpSecond"
>;

export interface InvitationAudience {
  invitationDisplayName: string;
  invitationDisplay: InvitationDisplay;
  rsvpPeople: RsvpPerson[];
}

export type InvitationDisplay =
  | {
      kind: "family" | "solo";
      name: string;
      accessibleLabel: string;
    }
  | {
      kind: "shared-last-name";
      firstNames: readonly [string, string];
      lastName: string;
      accessibleLabel: string;
    }
  | {
      kind: "couple";
      people: readonly [string, string];
      accessibleLabel: string;
    };

function normalizeNamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

interface SharedLastNameParts {
  firstNames: readonly [string, string];
  lastName: string;
}

function capitalizeName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/(^|[\s'-])(\p{L})/gu, (_, separator: string, letter: string) =>
      `${separator}${letter.toLocaleUpperCase("fr")}`,
    );
}

function getCoupleWithSharedLastName(
  firstGuestName: string,
  secondGuestName: string,
): SharedLastNameParts | null {
  const firstParts = firstGuestName.split(/\s+/).filter(Boolean);
  const secondParts = secondGuestName.split(/\s+/).filter(Boolean);
  let sharedPartCount = 0;

  while (
    sharedPartCount < firstParts.length - 1 &&
    sharedPartCount < secondParts.length - 1 &&
    normalizeNamePart(firstParts[firstParts.length - 1 - sharedPartCount]) ===
      normalizeNamePart(secondParts[secondParts.length - 1 - sharedPartCount])
  ) {
    sharedPartCount += 1;
  }

  if (sharedPartCount === 0) {
    return null;
  }

  const firstNames = capitalizeName(
    firstParts.slice(0, -sharedPartCount).join(" "),
  );
  const secondNames = capitalizeName(
    secondParts.slice(0, -sharedPartCount).join(" "),
  );
  const sharedLastName = secondParts
    .slice(-sharedPartCount)
    .join(" ")
    .toLocaleUpperCase("fr");

  return {
    firstNames: [firstNames, secondNames],
    lastName: sharedLastName,
  };
}

export function getInvitationDisplay(
  guest: GuestName,
  guestMembers: GuestMember[] = [],
): InvitationDisplay {
  const firstName = guest.firstName.trim();
  const lastName = guest.lastName.trim();
  const fallbackName = firstName || lastName || "Invités";
  const isFamilyName = /^(?:famille|family|משפחת)\b/iu.test(fallbackName);

  if (guestMembers.length > 0 || isFamilyName) {
    return {
      kind: "family",
      name: fallbackName,
      accessibleLabel: fallbackName,
    };
  }

  if (firstName && lastName) {
    const sharedName = getCoupleWithSharedLastName(firstName, lastName);

    if (sharedName) {
      const accessibleLabel = `${sharedName.firstNames[0]} & ${sharedName.firstNames[1]} ${sharedName.lastName}`;

      return {
        kind: "shared-last-name",
        firstNames: sharedName.firstNames,
        lastName: sharedName.lastName,
        accessibleLabel,
      };
    }

    return {
      kind: "couple",
      people: [firstName, lastName],
      accessibleLabel: `${firstName} & ${lastName}`,
    };
  }

  return {
    kind: "solo",
    name: fallbackName,
    accessibleLabel: fallbackName,
  };
}

export function getInvitationDisplayName(
  guest: GuestName,
  guestMembers: GuestMember[] = [],
): string {
  return getInvitationDisplay(guest, guestMembers).accessibleLabel;
}

export function getInvitationAudience(
  guest: AudienceGuest,
  guestMembers: GuestMember[],
): InvitationAudience {
  const invitationDisplay = getInvitationDisplay(guest, guestMembers);
  const invitationDisplayName = invitationDisplay.accessibleLabel;
  const firstName = guest.firstName.trim() || "Invité";
  const lastName = guest.lastName.trim();

  if (guestMembers.length > 0) {
    return {
      invitationDisplayName,
      invitationDisplay,
      rsvpPeople: guestMembers.map((member) => ({
        id: `member:${member.id}`,
        name: member.name.trim() || "Invité",
        source: "guest-member",
        responses: { ...member.rsvp },
      })),
    };
  }

  const rsvpPeople: RsvpPerson[] = [
    {
      id: "primary",
      name: firstName,
      source: "guest",
      responses: { ...guest.rsvp },
    },
  ];

  if (lastName) {
    rsvpPeople.push({
      id: "secondary",
      name: lastName,
      source: "guest",
      responses: { ...guest.rsvpSecond },
    });
  }

  return { invitationDisplayName, invitationDisplay, rsvpPeople };
}
