import type { Guest, GuestMember, RsvpPerson } from "@/lib/types";

type GuestName = Pick<Guest, "firstName" | "lastName">;
type AudienceGuest = Pick<
  Guest,
  "firstName" | "lastName" | "rsvp" | "rsvpSecond"
>;

export interface InvitationAudience {
  invitationDisplayName: string;
  rsvpPeople: RsvpPerson[];
}

function normalizeNamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

function formatCoupleWithSharedLastName(
  firstGuestName: string,
  secondGuestName: string,
): string | null {
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

  const firstNames = firstParts.slice(0, -sharedPartCount).join(" ");
  const secondNames = secondParts.slice(0, -sharedPartCount).join(" ");
  const sharedLastName = secondParts.slice(-sharedPartCount).join(" ");

  return `${firstNames} et ${secondNames} ${sharedLastName}`;
}

export function getInvitationDisplayName(
  guest: GuestName,
  guestMembers: GuestMember[] = [],
): string {
  const firstName = guest.firstName.trim();
  const lastName = guest.lastName.trim();

  if (guestMembers.length > 0) {
    return firstName || "Invités";
  }

  if (firstName && lastName) {
    return (
      formatCoupleWithSharedLastName(firstName, lastName) ??
      `${firstName} & ${lastName}`
    );
  }

  return firstName || lastName || "Invité";
}

export function getInvitationAudience(
  guest: AudienceGuest,
  guestMembers: GuestMember[],
): InvitationAudience {
  const invitationDisplayName = getInvitationDisplayName(guest, guestMembers);
  const firstName = guest.firstName.trim() || "Invité";
  const lastName = guest.lastName.trim();

  if (guestMembers.length > 0) {
    return {
      invitationDisplayName,
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

  return { invitationDisplayName, rsvpPeople };
}
