import { IncomingMessage, ServerResponse } from "http"
import { getAllUsers } from "../controllers/user"
import { parse } from 'url';

export const router = (req: IncomingMessage, res: ServerResponse) => {
    try {
      const parsedURL = parse(req.url || '', true)
      const path = parsedURL.pathname || ''
      const userIdMatch = path.match(/^\/api\/users\/([0-9a-fA-F\-]{36})$/);
      if(req.url) {
        switch(req.method) {
          case 'GET':
            if (path === '/api/users') {
              return getAllUsers(req, res);
            } else if (userIdMatch)
              //const userId = userIdMatch[1]
              return 
            break;
          default:
            break
            
        }
      }
    } catch(error) {
      console.error(error)
    }
}