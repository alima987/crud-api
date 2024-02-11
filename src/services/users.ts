import { IncomingMessage, ServerResponse } from 'http';
import { validate } from 'uuid';
import Database from '../database';

export const users = new Database();
export const getUser = (req: IncomingMessage, res: ServerResponse): void => {
  const usersData = users.getUsers();
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(usersData));
};

export const getUserById = (req: IncomingMessage, res: ServerResponse, id: string): void => {
  if (!validate(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid userId format' }));
  } else {
    const user = users.getUserById(id);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(user));
    }
  }
};
