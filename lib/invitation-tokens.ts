const PUBLIC_TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const GLOBAL_TOKEN_PREFIX = "global-";

export function isValidPublicToken(token: string): boolean {
  return PUBLIC_TOKEN_PATTERN.test(token);
}

export function isGlobalInvitationToken(token: string): boolean {
  return isValidPublicToken(token) && token.startsWith(GLOBAL_TOKEN_PREFIX);
}
