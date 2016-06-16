'use strict';

const path = require('path');
const fork = require('child_process').fork;
const socketioJwt = require('socketio-jwt');

const foursquare = {
  worker: null,
  active: false,
  progress: 0,
};
const yelp = {
  worker: null,
  active: false,
  progress: 0,
};

module.exports = function sockets(io) {
  io.use(socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    handshake: true,
  }));
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.decoded_token.id}`);

    if (foursquare.active) socket.emit('foursquare_progress', foursquare.progress);
    if (yelp.active) socket.emit('yelp_progress', yelp.progress);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.decoded_token.id}`);
    });

    // FOURSQUARE
    socket.on('foursquare_start', () => {
      if (!foursquare.active) {
        foursquare.active = !foursquare.active;
        io.sockets.emit('foursquare_start');
        foursquare.worker = fork(path.join(__dirname, '../workers/foursquare/foursquare.js'));
        foursquare.worker.on('message', (m) => {
          if (m === 'foursquare_done') {
            io.sockets.emit('foursquare_done');
          } else {
            foursquare.progress = m.foursquare_progress;
            io.sockets.emit('foursquare_progress', foursquare.progress);
          }
        });
        foursquare.worker.on('disconnect', () => {
          foursquare.active = !foursquare.active;
          console.log('Foursquare worker exited');
        });
      }
    });
    socket.on('foursquare_pause', () => {
      if (foursquare.active) {
        if (foursquare.worker.kill) foursquare.worker.kill();
        io.sockets.emit('foursquare_pause');
      }
    });

    // YELP
    socket.on('yelp_start', () => {
      if (!yelp.active) {
        yelp.active = !yelp.active;
        io.sockets.emit('yelp_start');
        yelp.worker = fork(path.join(__dirname, '../workers/yelp/yelp.js'));
        yelp.worker.on('message', (m) => {
          if (m === 'yelp_done') {
            io.sockets.emit('yelp_done');
          } else {
            yelp.progress = m.yelp_progress;
            io.sockets.emit('yelp_progress', yelp.progress);
          }
        });
        yelp.worker.on('disconnect', () => {
          yelp.active = !yelp.active;
          console.log('Yelp worker exited');
        });
      }
    });
    socket.on('yelp_pause', () => {
      if (yelp.active) {
        if (yelp.worker.kill) yelp.worker.kill();
        io.sockets.emit('yelp_pause');
      }
    });
  });
};
