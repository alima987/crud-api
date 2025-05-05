import { IncomingMessage, ServerResponse } from "http"
import { getUser, getUsersById, sendResponse } from "../controllers/user"
import { parse } from 'url';

export const router = (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (req.url) {
      switch (req.method) {
        case 'GET':
          if (/^\/api\/users\/?$/.test(req.url)) {
            getUser(req, res)
          }
          else if (/^\/api\/users\/[\w-]+$/.test(req.url)) {
            const userId = req.url.split('/').pop()
            userId && getUsersById(req, res, userId)
          } else {
            sendResponse(res, 404, 'User not found');
          }
          break;
        case 'POST':
          if (/^\/api\/users\/?$/.test(req.url)) {

            
          }
          break
        default:
          break
      }
    }

    // если не совпало ни с одним маршрутом:
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')

  } catch (error) {
    console.error(error)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
}
