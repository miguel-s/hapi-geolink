'use strict';

const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork;
const socketioJwt = require('socketio-jwt');

const names = fs.readdirSync(path.join(__dirname, '../workers/'));
const workers = [];

module.exports = function sockets(io) {
  io.use(socketioJwt.authorize({ secret: process.env.JWT_SECRET, handshake: true }));

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.decoded_token.id}`);
    socket.on('disconnect', () => console.log(`User disconnected: ${socket.decoded_token.id}`));

    workers.forEach((worker) => {
      const { active, origin, list, progress } = worker;
      if (active) {
        socket.emit('start', { origin, list });
        socket.emit('progress', { origin, list, progress });
      }
    });

    socket.on('start', (payload) => {
      const { origin, list } = payload;

      if (names.indexOf(origin) !== -1) {
        let worker = workers.find(w => w.origin === origin && w.list === list);

        if (!worker) {
          worker = {
            origin,
            list,
            active: false,
            proc: null,
            progress: 0,
          };
          workers.push(worker);
        }

        if (!worker.active) {
          worker.active = !worker.active;
          worker.proc = fork(path.join(__dirname, `../workers/${origin}/${origin}_${list}.js`));
          if (worker.proc) {
            console.log(`${origin}_${list} worker started`);

            worker.proc.on('message', (m) => {
              if (m.origin === origin && m.list === list) {
                switch (m.type) {
                  case 'start': {
                    io.sockets.emit('start', { origin, list });
                    break;
                  }
                  case 'stop': {
                    io.sockets.emit('stop', { origin, list });
                    break;
                  }
                  case 'progress': {
                    const progress = m.data;
                    worker.progress = progress;
                    io.sockets.emit('progress', { origin, list, progress });
                    break;
                  }
                  case 'error': {
                    const error = m.data;
                    console.log(error);
                    break;
                  }
                  default: {
                    break;
                  }
                }
              }
            });

            worker.proc.on('disconnect', () => {
              worker.active = !worker.active;
              io.sockets.emit('stop', { origin, list });
              console.log(`${origin}_${list} worker exited`);
            });
          }
        }
      }
    });

    socket.on('stop', (payload) => {
      const { origin, list } = payload;
      const worker = workers.find(w => w.origin === origin && w.list === list);
      if (worker && worker.active && worker.proc.kill) {
        worker.proc.kill();
        io.sockets.emit('stop', { origin, list });
      }
    });
  });
};
