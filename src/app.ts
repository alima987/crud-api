import * as http from 'http';

import { router } from './routes/router';
const PORT = process.env.PORT || 5002
const server = http.createServer((req, res) => {
    router(req, res)
})

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  })