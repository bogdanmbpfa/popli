export default async function generateAuthTokens(
  userId: string,
  jwtSecret: string,
  refreshTokenSecret: string,
): Promise<{ token: string; refreshToken: string }> {
  const [token, refreshToken] = await Promise.all([
    signJwt(jwtSecret, { id: userId }, '2h'),
    signJwt(refreshTokenSecret, { id: userId }, '1d'),
  ]);

  return { token, refreshToken };
}