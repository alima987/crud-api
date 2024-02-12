import http, { Server } from 'http';
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

    const port = 3000 + cluster!.worker!.id;

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
