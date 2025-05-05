import * as http from 'http';
import { config } from 'dotenv';
import { router } from './routes/router';
config();
const port= process.env.PORT || 5000
const server = http.createServer((req, res) => {
    router(req, res)
})

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  })