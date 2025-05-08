import { User } from "../models/user"

export default class Database {
    private users: User[]
    constructor () {
      this.users = []
    }
    getUsers() {
      return this.users
    }
    setUsers(users: User[]) {
      this.users = users;
    }
    getUserById (userId: string) {
      return this.users.find((user) => user.id === userId)
    }
    createUser(user: User) {
      this.users.push(user)
      return user
    }
    updateUser(user: User, userId: string) {
      const index = this.users.findIndex((user) => user.id === userId)
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...user}
      }
      return this.users[index]
    }
    deleteUser(userId: string) {
      const user = this.users.find((user) => user.id === userId)
      if (user) {
        this.users = this.users.filter((user) => user.id !== userId)
      }
      return user
    }
}