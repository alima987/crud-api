import { IncomingMessage, ServerResponse } from "http";
import { v4 as uuidv4, validate } from 'uuid';
import Database from "../db/database";
import { User } from "../models/user";

export const users = new Database()
export const sendResponse = (res: ServerResponse, statusCode: number, data: string) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = statusCode
  res.end(JSON.stringify({data}));
};
export const getUser = (req: IncomingMessage, res: ServerResponse) => {
  const userData = users.getUsers()
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(userData))
}

export const getUsersById = (req: IncomingMessage, res: ServerResponse, userId: string): void => {
  if (!validate(userId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Invalid userId format' }))
  } else {
    const userData = users.getUserById(userId)
    if (!userData) {
      sendResponse(res, 404, 'User not found');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(userData))
    }
  }
}
export const createUser = (req: IncomingMessage, res: ServerResponse) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', async() => {
    try {
      const data = await JSON.parse(body)
      const { username, age, hobbies } = data
      if (!username || !age || !hobbies) {
        sendResponse(res, 400, 'Missing required fields');
      } else {
        const newUser: User = {
          id: uuidv4(),
          username: username,
          age: age,
          hobbies: hobbies
        }
        const user = users.createUser(newUser)
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }
    } catch (error) {
      sendResponse(res, 400, 'Error parsing request body');
    }
  })
}
export const updateUser = (req: IncomingMessage, res: ServerResponse, userId: string) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', async() => {
    try {
      if (!validate(userId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid userId' }));
      } else {
        const data = await JSON.parse(body)
        const { username, age, hobbies } = data
        if (!username || !age || !hobbies) {
          sendResponse(res, 400, 'Missing required fields');
        } else {
          const user = users.updateUser(data, userId)
          if (!user) {
            sendResponse(res, 404, 'User not found');
          } else {
          user.username = username || user.username 
          user.age = age || user.age
          user.hobbies = hobbies || user.hobbies

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(user));
          }
        }
        }
    } catch (error) {
      sendResponse(res, 400, 'Error parsing request body');
    }
  })
}

export const deleteUser = (req: IncomingMessage, res: ServerResponse, userId: string) => {
  if (!validate(userId)) {
    sendResponse(res, 400, 'Invalid userId');
  } else {
    const user = users.deleteUser(userId)
    if (!user) {
      sendResponse(res, 404, 'User not found');
    } else {
      res.writeHead(204, { 'Content-Type': 'application/json' });
      res.end();
    }
  }
}