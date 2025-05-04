import { IncomingMessage, ServerResponse } from "http"
import { getAllUsers } from "../controllers/user"

export const router = (req: IncomingMessage, res: ServerResponse) => {
    try {
      switch(req.method) {
        case 'GET':
          return getAllUsers(req, res);
          break;
          
      }
    } catch(error) {
      console.error(error)
    }
}