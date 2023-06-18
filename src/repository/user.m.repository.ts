import { User } from '../enttities/user.js';
import { Repository } from './repository.js';
import createDebug from 'debug';
import { UserModel } from './user.m.model.js';
import { HttpError } from '../error/http.error.js';
const debug = createDebug('W7:UserRepo ');

export class UserRepo implements Repository<User> {
  constructor() {
    debug('Instantiated', UserModel);
  }

  async query(): Promise<User[]> {
    const allData = await UserModel.find()
      .populate('friends', {
        id: 0,
        friends: 0,
        enemies: 0,
      })
      .populate('enemies', {
        id: 0,
        friends: 0,
        enemies: 0,
      })
      .exec();
    return allData;
  }

  async queryById(id: string): Promise<User> {
    const result = await UserModel.findById(id)
      .populate('friends', { id: 0, friends: 0, enemies: 0 })
      .populate('enemies', { id: 0, friends: 0, enemies: 0 })
      .exec();
    if (result === null) throw new HttpError(400, 'Not found', 'No found');
    return result;
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const newUser = await UserModel.create(data);
    return newUser;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const newUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();

    if (newUser === null)
      throw new HttpError(404, 'Not found', 'User not found');
    return newUser;
  }

  async search({
    key,
    value,
  }: {
    key: string;
    value: unknown;
  }): Promise<User[]> {
    const result = await UserModel.find({ [key]: value }).exec();
    return result;
  }

  async delete(id: string): Promise<void> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    if (result === null)
      throw new HttpError(404, 'Not found', 'User not found');
  }
}
