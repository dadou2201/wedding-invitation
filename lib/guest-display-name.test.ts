import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error -- Node's type-stripping test runner loads this TypeScript module directly.
import { getInvitationAudience } from "./guest-display-name.ts";

const pending = {
  wedding: "pending",
  henna: "pending",
  shabbat: "pending",
} as const;

const baseGuest = {
  firstName: "",
  lastName: "",
  rsvp: pending,
  rsvpSecond: pending,
};

test("solo: the first name is used for the card and RSVP", () => {
  const audience = getInvitationAudience(
    { ...baseGuest, firstName: "David Bourak" },
    [],
  );

  assert.equal(audience.invitationDisplayName, "David Bourak");
  assert.deepEqual(
    audience.rsvpPeople.map(({ id, name }) => ({ id, name })),
    [{ id: "primary", name: "David Bourak" }],
  );
});

test("couple: First Name and Last Name remain two independent people", () => {
  const audience = getInvitationAudience(
    { ...baseGuest, firstName: "David", lastName: "Clara" },
    [],
  );

  assert.equal(audience.invitationDisplayName, "David & Clara");
  assert.deepEqual(
    audience.rsvpPeople.map(({ id, name }) => ({ id, name })),
    [
      { id: "primary", name: "David" },
      { id: "secondary", name: "Clara" },
    ],
  );
});

test("couple: a shared last name is displayed only once on the invitation", () => {
  const audience = getInvitationAudience(
    {
      ...baseGuest,
      firstName: "Steven Guez",
      lastName: "Salome Guez",
    },
    [],
  );

  assert.equal(audience.invitationDisplayName, "Steven et Salome Guez");
  assert.deepEqual(
    audience.rsvpPeople.map(({ id, name }) => ({ id, name })),
    [
      { id: "primary", name: "Steven Guez" },
      { id: "secondary", name: "Salome Guez" },
    ],
  );
});

test("couple: a shared multi-word last name is displayed only once", () => {
  const audience = getInvitationAudience(
    {
      ...baseGuest,
      firstName: "David Ben Attar",
      lastName: "Sarah Ben Attar",
    },
    [],
  );

  assert.equal(audience.invitationDisplayName, "David et Sarah Ben Attar");
});

test("couple: different last names keep the existing display", () => {
  const audience = getInvitationAudience(
    {
      ...baseGuest,
      firstName: "Steven Guez",
      lastName: "Salome Cohen",
    },
    [],
  );

  assert.equal(audience.invitationDisplayName, "Steven Guez & Salome Cohen");
});

test("family: linked members are the only RSVP people", () => {
  const members = [
    "David Bourak",
    "Mickaël Bourak",
    "Fabienne Bourak",
    "Serge Bourak",
    "Liora Bourak",
  ].map((name, index) => ({ id: index + 1, name, rsvp: pending }));
  const audience = getInvitationAudience(
    { ...baseGuest, firstName: "Famille Bourak" },
    members,
  );

  assert.equal(audience.invitationDisplayName, "Famille Bourak");
  assert.deepEqual(
    audience.rsvpPeople.map(({ name }) => name),
    members.map(({ name }) => name),
  );
  assert.ok(
    audience.rsvpPeople.every(({ source }) => source === "guest-member"),
  );
});

test("linked members take priority over Last Name", () => {
  const members = ["Personne A", "Personne B", "Personne C"].map(
    (name, index) => ({ id: index + 20, name, rsvp: pending }),
  );
  const audience = getInvitationAudience(
    {
      ...baseGuest,
      firstName: "Famille Test",
      lastName: "Valeur à ignorer",
    },
    members,
  );

  assert.equal(audience.invitationDisplayName, "Famille Test");
  assert.deepEqual(
    audience.rsvpPeople.map(({ name }) => name),
    ["Personne A", "Personne B", "Personne C"],
  );
});
