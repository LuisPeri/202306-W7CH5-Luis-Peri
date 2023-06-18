import jwt, { JwtPayload } from 'jsonwebtoken';
import { secret } from '../config.js';
import { HttpError } from '../error/http.error.js';
import { compare, hash } from 'bcrypt';

export type PayloadToken = {
  id: string;
  userName: string;
} & JwtPayload;

export class AuthServices {
  private static salt = 10;

  static createJWT(payload: PayloadToken) {
    const token = jwt.sign(payload, secret!);
    return token;
  }

  static verifyJWTGettingPayload(token: string) {
    try {
      const result = jwt.verify(token, secret!);
      if (typeof result === 'string')
        throw new HttpError(498, 'Invalid Token', result);
      return result as PayloadToken;
    } catch (error) {
      throw new HttpError(498, 'Invalid Token', (error as Error).message);
    }
  }

  static hash(value: string) {
    return hash(value, AuthServices.salt);
  }

  static compare(value: string, hash: string) {
    return compare(value, hash);
  }
}
