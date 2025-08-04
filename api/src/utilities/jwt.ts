import { SignJWT, jwtVerify } from 'jose';

export const signJwt = async (
  payload: Record<string, unknown>,
  secret: string,
) => {
  return await new SignJWT(payload)
    .setIssuedAt()
    .setIssuer('Popli')
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30 d')
    .sign(new TextEncoder().encode(secret));
};

export const verifyJwt = async (token: string, secret: string) => {
  return await jwtVerify(token, new TextEncoder().encode(secret));
};
