import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4, validate } from 'uuid';
import Database from '../database';

export const sendResp = (res: ServerResponse, statusCode: number, message: string) => {
  if (res.headersSent) {
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = statusCode;
  res.end(JSON.stringify({ message }));
};

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
      sendResp(res, 404, 'User not found');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(user));
    }
  }
};
export const createUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const requestData = await JSON.parse(body);
      const { username, age, hobbies } = requestData;

      if (username && age && hobbies) {
        if (
          Array.isArray(hobbies) &&
          hobbies.every((item) => typeof item === 'string') &&
          typeof age === 'number' &&
          typeof username === 'string'
        ) {
          const newUser = {
            id: uuidv4(),
            username,
            age,
            hobbies,
          };
          const user = users.userCreate(newUser);

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 201;
          res.end(JSON.stringify(user));
        } else {
          sendResp(
            res,
            400,
            'Username must be a string / Age must be a number / Hobbies must be an array of strings'
          );
        }
      } else {
        sendResp(res, 400, 'Body does not contain required fields');
      }
    } catch (error) {
      sendResp(res, 400, 'Error parsing request body');
    }
  });
};
export const userUpdate = async (
  req: IncomingMessage,
  res: ServerResponse,
  id: string
): Promise<void> => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      if (!validate(id)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid userId' }));
      } else {
        const requestData = await JSON.parse(body);
        const { username, age, hobbies } = requestData;

        if (
          Array.isArray(hobbies) &&
          hobbies.every((item) => typeof item === 'string') &&
          typeof age === 'number' &&
          typeof username === 'string'
        ) {
          const user = users.userUpdate(id, requestData);

          if (!user) {
            sendResp(res, 404, 'User not found');
          } else {
            user.username = username || user.username;
            user.age = age || user.age;
            user.hobbies = hobbies || user.hobbies;

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(user));
          }
        } else {
          sendResp(
            res,
            400,
            'Username must be a string / Age must be a number / Hobbies must be an array of strings'
          );
        }
      }
    } catch (error) {
      sendResp(res, 400, 'Error parsing request body');
    }
  });
};
