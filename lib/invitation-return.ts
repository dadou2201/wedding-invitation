"use client";

import {
  isGlobalInvitationToken,
  isValidPublicToken,
} from "@/lib/invitation-tokens";

const STORAGE_PREFIX = "clara-david:invitation-return:";
const COOKIE_PREFIX = "clara_david_invitation_return_";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function isPersonalInvitationToken(token: string): boolean {
  return isValidPublicToken(token) && !isGlobalInvitationToken(token);
}

function storageKey(globalToken: string): string {
  return `${STORAGE_PREFIX}${globalToken}`;
}

function cookieKey(globalToken: string): string {
  return `${COOKIE_PREFIX}${globalToken}`;
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

export function rememberPersonalInvitation(
  globalToken: string,
  personalToken: string,
): void {
  if (
    !isGlobalInvitationToken(globalToken) ||
    !isPersonalInvitationToken(personalToken)
  ) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey(globalToken), personalToken);
  } catch {
    // Some private browsers block localStorage. The cookie below is the fallback.
  }

  try {
    document.cookie = `${cookieKey(globalToken)}=${encodeURIComponent(personalToken)}; Max-Age=${ONE_YEAR_IN_SECONDS}; Path=/; SameSite=Lax`;
  } catch {
    // Navigation still succeeds even if browser persistence is unavailable.
  }
}

export function getRememberedPersonalInvitation(
  globalToken: string,
): string | null {
  if (!isGlobalInvitationToken(globalToken)) {
    return null;
  }

  let storedToken: string | null = null;

  try {
    storedToken = window.localStorage.getItem(storageKey(globalToken));
  } catch {
    // Fall back to the cookie when localStorage cannot be read.
  }

  if (!storedToken) {
    try {
      storedToken = readCookie(cookieKey(globalToken));
    } catch {
      storedToken = null;
    }
  }

  return storedToken && isPersonalInvitationToken(storedToken)
    ? storedToken
    : null;
}
