import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { user, password, db } from '../config.js';
dotenv.config();

export const dbConnect = () => {
  const url = `mongodb+srv://${user}:${password}@cluster0.cylmbak.mongodb.net/${db}?retryWrites=true&w=majority`;
  return mongoose.connect(url);
};
