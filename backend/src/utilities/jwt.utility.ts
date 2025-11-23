import { Injectable } from '@nestjs/common';
import { jwtVerify, SignJWT } from 'jose';

import { JWTPayloadDTO } from '@resources';

@Injectable()
export class JWTUtilityService {
  constructor() {}

  async sign(
    secret: string,
    payload: Partial<JWTPayloadDTO>,
    expiresIn?: string,
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

  async verify(jwt: string, secret: string): Promise<void> {
    const encodedSecret = new TextEncoder().encode(secret);

    await jwtVerify(jwt, encodedSecret, {
      algorithms: ['HS256'],
    });
  }
}
