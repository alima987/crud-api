import { IncomingMessage, ServerResponse } from 'http';

import { getUser, getUserById } from './services/users';
import { sendResp } from './services/users';

export const router = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (req.url) {
      switch (req.method) {
        case 'GET':
          if (/^\/api\/users\/?$/.test(req.url)) {
            getUser(req, res);
          } else if (/^\/api\/users\/[\w-]+$/.test(req.url)) {
            const userId = req.url.split('/').pop();
            userId && getUserById(req, res, userId);
          } else {
            sendResp(res, 404, 'Invalid endpoint');
          }
          break;
        default:
          sendResp(res, 404, 'Unsupported operation');
      }
    } else {
      sendResp(res, 404, 'Invalid endpoint');
    }
  } catch {
    sendResp(res, 500, 'Internal Server Error');
  }
};
