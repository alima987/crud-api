import { IncomingMessage, ServerResponse } from "http";
import { users } from "../models/user";

export const getAllUsers = (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(users))
}