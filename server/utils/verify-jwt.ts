import { jwtVerify } from 'jose';

export default async function verifyJwt(
  token: string,
  secret: string,
): Promise<void> {
  const encodedSecret = new TextEncoder().encode(secret);

  await jwtVerify(token, encodedSecret, {
    algorithms: ['HS256'],
  });
}
