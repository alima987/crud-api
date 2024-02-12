import { User } from './interface/user';

export default class Database {
  private users: User[];

  constructor() {
    this.users = [];
  }

  getUser() {
    return this.users;
  }

  getUserById(userId: string) {
    return this.users.find((user) => user.id === userId);
  }
  userCreate(user: User) {
    this.users.push(user);
    return user;
  }
  userUpdate(userId: string, user: User) {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...user };
    }
    return this.users[index];
  }
  userDelete(userId: string) {
    const user = this.users.find((user) => user.id === userId);
    console.log(user);
    if (user) {
      this.users = this.users.filter((user) => user.id !== userId);
    }
    return user;
  }
}
