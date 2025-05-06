import http, { Server, IncomingMessage, ServerResponse } from 'http';
import { config } from 'dotenv';
import { router } from './routes/router';
import  cluster, { Worker } from 'cluster';
import process from 'process';
import os from 'os'
import Database from './db/database';
config();
export let server: http.Server;
export const users = new Database()
const port= process.env.PORT || 5000
const numCPUs = os.cpus().length
const workers: Worker[] = []

if (process.env.MODE === 'cluster') {
    if (cluster.isPrimary) {
        for (let i = 0; i < numCPUs - 1; i++) {
            const worker = cluster.fork()
            workers.push(worker)
        }
        let currentInt = 0
        const balance = (req: IncomingMessage, res: ServerResponse) => {
          let body = ''
          req.on('data', (chunk) => { body += chunk });
          req.on('end', () => {
            const worker = workers[currentInt]
            currentInt = (currentInt + 1) % (numCPUs - 1)
            const reqToWorker = http.request({
                port: +port + worker.id,
                method: req.method,
                path: req.url,
                headers: { 'Content-Type': 'application/json' }   
            }, (respFromWorker) => {
                let data = ''
                respFromWorker.on('data', (chunk) => {
                    data += chunk
                })
                respFromWorker.on('end', () => {
                    res.setHeader('Content-Type', 'application/json')
                    res.statusCode = respFromWorker.statusCode || 500
                    res.end(data)
                })
            })
            reqToWorker.on('error', (error) => {
              console.error(error)
            })
            reqToWorker.write(body)
            reqToWorker.end()
          })
        }
        http.createServer(balance).listen(port, () => {
            console.log(`Balance #${process.pid} is running on port ${port}`);
        })
        cluster.on("exit", (worker) => {
          console.log(`Worker ${worker.process.pid} died. New request`)
          const index = workers.indexOf(worker);
          if (index !== -1) {
            workers.splice(index, 1);
          }
          const newWorker = cluster.fork()
          workers.push(newWorker)
        })
    } else {
        const server = http.createServer((req, res) => {
            router(req, res)
            console.log(`Worker #${process.pid} received request`);
        })
        const port = 4000 + cluster!.worker!.id;
        
        server.listen(port, () => {
            console.log(`Worker ${process.pid} is running on port ${port}`);
        })
    }
} else {
     const server = http.createServer((req, res) => {
        router(req, res)
    })
    
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    })
}