import createDebug from 'debug';
import { Router as createRouter } from 'express';
import { Repository } from '../repository/repository.js';
import { User } from '../enttities/user.js';
import { UserRepo } from '../repository/user.m.repository.js';
import { UserController } from '../controllers/user.controller.js';
import { AuthInterceptor } from '../middleware/auth.interceptor.js';
const debug = createDebug('W7:UserRouter ');

debug('Executed');
const repo: Repository<User> = new UserRepo();
const controller = new UserController(repo);
const interceptor = new AuthInterceptor(repo);
export const userRouter = createRouter();

userRouter.get('/', controller.getAll.bind(controller));
userRouter.get('/:id', controller.getById.bind(controller));
userRouter.post('/register', controller.register.bind(controller));
userRouter.patch('/login', controller.login.bind(controller));
userRouter.patch(
  '/addfriend/:id',
  interceptor.logged.bind(interceptor),
  controller.addNewFriendOrEnemy.bind(controller)
);
userRouter.patch(
  '/addenemy/:id',
  interceptor.logged.bind(controller),
  controller.addNewFriendOrEnemy.bind(controller)
);
