import http, { Server, IncomingMessage, ServerResponse } from 'http';
import { config } from 'dotenv';
import { router } from './routes/router';
import  cluster, { Worker } from 'cluster';
import process from 'process';
import os from 'os'
import Database from './db/database';
config();
export let server: Server;
export const users = new Database()
const port= process.env.PORT || 5000
const numCPUs = os.cpus().length - 1
const workers: Worker[] = []

if (process.env.MODE === 'cluster') {
    if (cluster.isPrimary) {
        for (let i = 0; i < numCPUs; i++) {
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
        server = http.createServer((req, res) => {
            router(req, res)
            console.log(`Worker #${process.pid} received request`);
        })
        const port = 4000 + cluster!.worker!.id;
        
        server.listen(port, () => {
            console.log(`Worker ${process.pid} is running on port ${port}`);
        })
        // Синхронизация данных между воркерами
        process.on('message', (message: any) => {
            if (message.type === 'sync-db') {
                // Обновляем состояние данных в воркере
                users.setUsers(message.data);
            }
        });
    }
} else {
    server = http.createServer((req, res) => {
        router(req, res)
    })
    
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    })
}

/*import http, { Server, IncomingMessage, ServerResponse } from 'http';
import { config } from 'dotenv';
import { router } from './routes/router';
import cluster, { Worker } from 'cluster';
import process from 'process';
import os from 'os';
import Database from './db/database';

config();

export let server: Server;
let users: Database;
const port = process.env.PORT || 5000;
const numCPUs = os.cpus().length - 1;
const workers: Worker[] = [];

if (process.env.MODE === 'cluster') {
    if (cluster.isPrimary) {
        users = new Database();
        for (let id in cluster.workers) {
            cluster.workers[id]?.on('message', (message) => {
                if (message.type === 'create-user') {
                    users.createUser(message.payload);
    
                    // отправляем обновлённые данные всем воркерам
                    for (let wid in cluster.workers) {
                        cluster.workers[wid]?.send({
                            type: 'sync-db',
                            data: users.getUsers()
                        });
                    }
                }
            });
        }
        for (let i = 0; i < numCPUs; i++) {
            const worker = cluster.fork();
            workers.push(worker);
        }

        let currentInt = 0;
        
        // Балансировка нагрузки
        const balance = (req: IncomingMessage, res: ServerResponse) => {
            let body = '';
            req.on('data', (chunk) => { body += chunk });
            req.on('end', () => {
                // Выбираем воркера по очереди
                const worker = workers[currentInt];
                currentInt = (currentInt + 1) % numCPUs;

                // Перенаправляем запрос к воркеру
                const reqToWorker = http.request({
                    port: +port + worker.id,
                    method: req.method,
                    path: req.url,
                    headers: { 'Content-Type': 'application/json' }   
                }, (respFromWorker) => {
                    let data = '';
                    respFromWorker.on('data', (chunk) => {
                        data += chunk;
                    });
                    respFromWorker.on('end', () => {
                        res.setHeader('Content-Type', 'application/json');
                        res.statusCode = respFromWorker.statusCode || 500;
                        res.end(data);
                    });
                });

                reqToWorker.on('error', (error) => {
                    console.error(error);
                });

                reqToWorker.write(body);
                reqToWorker.end();
            });
        };

        // Запускаем балансировщик
        http.createServer(balance).listen(port, () => {
            console.log(`Balance #${process.pid} is running on port ${port}`);
        });

        // Обработчик событий при завершении работы воркера
        cluster.on("exit", (worker) => {
            console.log(`Worker ${worker.process.pid} died. Restarting...`);
            const index = workers.indexOf(worker);
            if (index !== -1) {
                workers.splice(index, 1);
            }
            const newWorker = cluster.fork();
            workers.push(newWorker);
        });
    } else {
        // Запуск каждого воркера
        server = http.createServer((req, res) => {
            router(req, res);
            console.log(`Worker #${process.pid} received request`);
        });

        // Определяем уникальный порт для каждого воркера
        const workerPort = 4000 + cluster.worker!.id;
        server.listen(workerPort, () => {
            console.log(`Worker ${process.pid} is running on port ${workerPort}`);
        });

        // Синхронизация данных между воркерами
        process.on('message', (message: any) => {
            if (message.type === 'sync-db') {
                // Обновляем состояние данных в воркере
                users.setUsers(message.data);
            }
        });
    }
} else {
    // Запуск сервера без кластеризации (для разработки или других целей)
    server = http.createServer((req, res) => {
        router(req, res);
    });

    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}*/
