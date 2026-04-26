import { type JWTPayload, SignJWT } from 'jose';

export default function signJwt(
  secret: string,
  payload: JWTPayload,
  expiresIn: string,
): Promise<string> {
  const encodedSecret = new TextEncoder().encode(secret);

  const jwt = new SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setIssuedAt()
    .setIssuer('Popli')
    .setExpirationTime(expiresIn || '30d');

  return jwt.sign(encodedSecret);
}
