/**
 * A 401 only ends the session when the failed request was sent with the token that is stored now.
 * A request still carrying an older (revoked) token, e.g. one in flight while the session switched to
 * another account, must not log the new session out. Unknown header or token: log out as before.
 */
export const shouldLogoutOn401 = (sentAuthHeader: unknown, currentToken: string | null | undefined) => {
  if (typeof sentAuthHeader !== 'string' || !sentAuthHeader || !currentToken) return true
  return sentAuthHeader === `Bearer ${currentToken}`
}
