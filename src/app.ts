import http, { Server, IncomingMessage, ServerResponse } from 'http';
import { config } from 'dotenv';
import cluster, { Worker } from 'cluster';
import os from 'os';
import Database from './database';
import { router } from './router';

config();
export let server: Server;
export const users = new Database();
const port = process.env.PORT || 5000;
const CPUsnum = os.cpus().length;
const workers: Worker[] = [];

if (process.env.MODE === 'cluster') {
  if (cluster.isPrimary) {
    for (let i = 0; i < CPUsnum - 1; i++) {
      const worker = cluster.fork();
      workers.push(worker);
    }

    let currWorkInd = 0;

    const balance = (req: IncomingMessage, res: ServerResponse) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const worker = workers[currWorkInd];
        currWorkInd = (currWorkInd + 1) % (CPUsnum - 1);

        const reqToWorker = http.request(
          {
            port: +port + worker.id,
            method: req.method,
            path: req.url,
            headers: { 'Content-Type': 'application/json' },
          },
          (respFromWorker) => {
            let dataFromWorker = '';

            respFromWorker.on('data', (chunk) => {
              dataFromWorker += chunk;
            });
            respFromWorker.on('end', () => {
              res.statusCode = respFromWorker.statusCode || 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(dataFromWorker);
            });
          }
        );

        reqToWorker.on('error', (e) => {
          console.error(e);
        });

        reqToWorker.write(body);
        reqToWorker.end();
      });
    };
    http.createServer(balance).listen(port, () => {
      console.log(`Balance #${process.pid} is running on port ${port}`);
    });
    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
      const index = workers.indexOf(worker);

      if (index !== -1) {
        workers.splice(index, 1);
      }

      const newWorker = cluster.fork();
      workers.push(newWorker);
    });
  } else {
    const server = http.createServer((req, res) => {
      router(req, res);
      console.log(`Worker #${process.pid} received request`);
    });

    const port = 4000 + cluster!.worker!.id;

    server.listen(port, () => {
      console.log(`Worker #${process.pid} is running on port ${port}`);
    });
  }
} else {
  const server = http.createServer((req, res) => {
    router(req, res);
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
