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
    return `${firstName} & ${lastName}`;
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
