import { User } from './interface/user';

export default class Database {
  private users: User[];

  constructor() {
    this.users = [];
  }

  getUsers() {
    return this.users;
  }

  getUserById(userId: string) {
    return this.users.find((user) => user.id === userId);
  }
}
