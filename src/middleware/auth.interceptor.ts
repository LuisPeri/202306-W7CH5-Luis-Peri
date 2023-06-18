import { NextFunction, Request, Response } from 'express';
import { UserRepo } from '../repository/user.m.repository.js';
import createDebug from 'debug';
import { HttpError } from '../error/http.error.js';
import { AuthServices } from '../services/auth.js';
const debug = createDebug('W7:AuthInterceptor ');

export class AuthInterceptor {
  // eslint-disable-next-line no-unused-vars
  constructor(private repo: UserRepo) {
    debug('Instantiated');
  }

  logged(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.get('Authorization');
      if (!authHeader)
        throw new HttpError(401, 'Not Authorized', 'Not Authorized');

      if (!authHeader.startsWith('Bearer'))
        throw new HttpError(
          401,
          'Not Authorized',
          'No Bearer in Authorization header'
        );

      const token = authHeader.slice(7);
      const payload = AuthServices.verifyJWTGettingPayload(token);

      req.body.tokenPayload = payload;
      next();
    } catch (error) {
      next(error);
    }
  }

  async authorized(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.tokenPayload)
        throw new HttpError(498, 'Token Not Found', 'Token not found');
    } catch (error) {
      next(error);
    }
  }
}
