const PUBLIC_TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export function isValidPublicToken(token: string): boolean {
  return PUBLIC_TOKEN_PATTERN.test(token);
}
