import type { Guest } from "@/lib/types";

type GuestName = Pick<Guest, "firstName" | "lastName">;

export function getInvitationDisplayName(guest: GuestName): string {
  const firstName = guest.firstName.trim();
  const lastName = guest.lastName.trim();

  if (firstName && lastName) {
    return `${firstName} & ${lastName}`;
  }

  return firstName || lastName;
}
