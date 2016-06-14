'use strict';

const path = require('path');
const fork = require('child_process').fork;
const socketioJwt = require('socketio-jwt');

let foursquare = false;
let fs = {};
let yelp = false;
let yp = {};

module.exports = function sockets(io) {
  io.use(socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    handshake: true,
  }));
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.decoded_token.id}`);

    if (foursquare) socket.emit('foursquare_start');
    if (yelp) socket.emit('yelp_start');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    // FOURSQUARE
    socket.on('foursquare_start', () => {
      if (!foursquare) {
        foursquare = !foursquare;
        io.sockets.emit('foursquare_start');
        fs = fork(path.join(__dirname, '../workers/foursquare/foursquare.js'));
        fs.on('message', (m) => {
          if (m === 'foursquare_done') io.sockets.emit('foursquare_done');
          else io.sockets.emit('foursquare_progress', m.foursquare_progress);
        });
        fs.on('disconnect', () => {
          foursquare = !foursquare;
          console.log('Child process exited');
        });
      }
    });
    socket.on('foursquare_pause', () => {
      if (foursquare) {
        if (fs.kill) fs.kill();
        io.sockets.emit('foursquare_pause');
      }
    });

    // YELP
    socket.on('yelp_start', () => {
      if (!yelp) {
        yelp = !yelp;
        io.sockets.emit('yelp_start');
        yp = fork(path.join(__dirname, '../workers/yelp/yelp.js'));
        yp.on('message', (m) => {
          if (m === 'yelp_done') io.sockets.emit('yelp_done');
          else io.sockets.emit('yelp_progress', m.yelp_progress);
        });
        yp.on('disconnect', () => {
          yelp = !yelp;
          console.log('Child process exited');
        });
      }
    });
    socket.on('yelp_pause', () => {
      if (yelp) {
        if (yp.kill) yp.kill();
        io.sockets.emit('yelp_pause');
      }
    });
  });
};
