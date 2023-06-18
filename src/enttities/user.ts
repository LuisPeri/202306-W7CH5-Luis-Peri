export type User = {
  id: string;
  userName: string;
  email: string;
  password: string;
  friends: User[];
  enemies: User[];
};

export type UserLogin = {
  user: string;
  password: string;
};
