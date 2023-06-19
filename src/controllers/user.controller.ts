/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { User } from '../enttities/user.js';
import { UserRepo } from '../repository/user.m.repository.js';
import { Controller } from './controller.js';
import createDebug from 'debug';
import { AuthServices, PayloadToken } from '../services/auth.js';
import { HttpError } from '../error/http.error.js';
import { LoginResponse } from '../types/api.response.js';
const debug = createDebug('W7:UserController ');

export class UserController extends Controller<User> {
  constructor(public repo: UserRepo) {
    super();
    debug('Instantiated');
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const password = await AuthServices.hash(req.body.password);
      req.body.password = password;
      res.status(201);
      res.send(await this.repo.create(req.body));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.user || !req.body.password)
        throw new HttpError(400, 'Bad Request', 'Invalid user or password');
      let data = await this.repo.search({
        key: 'userName',
        value: req.body.user,
      });
      if (!data.length) {
        data = await this.repo.search({
          key: 'email',
          value: req.body.user,
        });
      }

      if (!data.length)
        throw new HttpError(400, 'Bad Request', 'Invalid user or password');

      const isUserValid = await AuthServices.compare(
        req.body.password,
        data[0].password
      );

      if (!isUserValid)
        throw new HttpError(400, 'Bad Request', 'Invalid user or password');

      const payload: PayloadToken = {
        id: data[0].id,
        userName: data[0].userName,
      };
      const token = AuthServices.createJWT(payload);
      const response: LoginResponse = {
        token,
        user: data[0],
      };

      res.send(response);
    } catch (error) {
      next(error);
    }
  }

  async addNewFriendOrEnemy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body.tokenPayload as PayloadToken;
      const user = await this.repo.queryById(id);
      delete req.body.tokenPayload;
      const newUser = await this.repo.queryById(req.params.id);
      if (req.path.includes('friend')) {
        user.friends.push(newUser);
      }

      if (req.path.includes('enemy')) {
        user.enemies.push(newUser);
      }

      await this.repo.update(id, user);
      res.status(201);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  async removeFriendOrEnemy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.body.tokenPayload as PayloadToken;
      const user = await this.repo.queryById(userId);
      delete req.body.tokenPayload;
      const userToDelete = await this.repo.queryById(req.params.id);
      if (req.path.includes('friends')) {
        const userIndex = user.friends.findIndex(
          (item) => item.id === userToDelete.id
        );
        user.friends.splice(userIndex, 1);
        await this.repo.update(userId, user);
        await this.repo.update(req.params.id, userToDelete);
        res.status(201);
        res.send(user);
      }

      if (req.path.includes('enemies')) {
        const userIndex = user.enemies.findIndex(
          (item) => item.id === userToDelete.id
        );
        user.enemies.splice(userIndex, 1);
        await this.repo.update(userId, user);
        await this.repo.update(req.params.id, userToDelete);
        res.status(201);
        res.send(user);
      }
    } catch (error) {
      next(error);
    }
  }
}
