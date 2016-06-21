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
const twitter = {
  worker: null,
  active: false,
  progress: 0,
};
const facebook = {
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

    if (foursquare.active) {
      socket.emit('foursquare_start');
      socket.emit('foursquare_progress', foursquare.progress);
    }
    if (yelp.active) {
      socket.emit('yelp_start');
      socket.emit('yelp_progress', yelp.progress);
    }
    if (twitter.active) {
      socket.emit('twitter_start');
      socket.emit('twitter_progress', twitter.progress);
    }
    if (facebook.active) {
      socket.emit('facebook_start');
      socket.emit('facebook_progress', facebook.progress);
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.decoded_token.id}`);
    });

    // FOURSQUARE
    socket.on('foursquare_start', () => {
      if (!foursquare.active) {
        foursquare.active = !foursquare.active;
        io.sockets.emit('foursquare_start');
        foursquare.worker = fork(path.join(__dirname, '../workers/foursquare/foursquare.js'));
        console.log('Foursquare worker started');
        foursquare.worker.on('message', (m) => {
          if (m === 'foursquare_stop') {
            io.sockets.emit('foursquare_stop');
          } else {
            if (m.foursquare_progress) {
              foursquare.progress = m.foursquare_progress;
              io.sockets.emit('foursquare_progress', foursquare.progress);
            }
            if (m.foursquare_error) {
              console.log(m.foursquare_error);
            }
          }
        });
        foursquare.worker.on('disconnect', () => {
          foursquare.active = !foursquare.active;
          console.log('Foursquare worker exited');
        });
      }
    });
    socket.on('foursquare_stop', () => {
      if (foursquare.active && foursquare.worker.kill) {
        foursquare.worker.kill();
        io.sockets.emit('foursquare_stop');
      }
    });

    // YELP
    socket.on('yelp_start', () => {
      if (!yelp.active) {
        yelp.active = !yelp.active;
        io.sockets.emit('yelp_start');
        yelp.worker = fork(path.join(__dirname, '../workers/yelp/yelp.js'));
        console.log('Yelp worker started');
        yelp.worker.on('message', (m) => {
          if (m === 'yelp_stop') {
            io.sockets.emit('yelp_stop');
          } else {
            if (m.yelp_progress) {
              yelp.progress = m.yelp_progress;
              io.sockets.emit('yelp_progress', yelp.progress);
            }
            if (m.yelp_error) {
              console.log(m.yelp_error);
            }
          }
        });
        yelp.worker.on('disconnect', () => {
          yelp.active = !yelp.active;
          console.log('Yelp worker exited');
        });
      }
    });
    socket.on('yelp_stop', () => {
      if (yelp.active && yelp.worker.kill) {
        yelp.worker.kill();
        io.sockets.emit('yelp_stop');
      }
    });

    // TWITTER
    socket.on('twitter_start', () => {
      if (!twitter.active) {
        twitter.active = !twitter.active;
        io.sockets.emit('twitter_start');
        twitter.worker = fork(path.join(__dirname, '../workers/twitter/twitter.js'));
        console.log('Twitter worker started');
        twitter.worker.on('message', (m) => {
          if (m === 'twitter_stop') {
            io.sockets.emit('twitter_stop');
          } else {
            if (m.twitter_progress) {
              twitter.progress = Math.floor(m.twitter_progress / 100); // dive by 100 as a lazy quick fix for chunk length
              io.sockets.emit('twitter_progress', twitter.progress);
            }
            if (m.twitter_error) {
              console.log(m.twitter_error);
            }
          }
        });
        twitter.worker.on('disconnect', () => {
          twitter.active = !twitter.active;
          console.log('Twitter worker exited');
        });
      }
    });
    socket.on('twitter_stop', () => {
      if (twitter.active && twitter.worker.kill) {
        twitter.worker.kill();
        io.sockets.emit('twitter_stop');
      }
    });

    // FACEBOOK
    socket.on('facebook_start', () => {
      if (!facebook.active) {
        facebook.active = !facebook.active;
        io.sockets.emit('facebook_start');
        facebook.worker = fork(path.join(__dirname, '../workers/facebook/facebook.js'));
        console.log('Facebook worker started');
        facebook.worker.on('message', (m) => {
          if (m === 'facebook_stop') {
            io.sockets.emit('facebook_stop');
          } else {
            if (m.facebook_progress) {
              facebook.progress = m.facebook_progress;
              io.sockets.emit('facebook_progress', facebook.progress);
            }
            if (m.facebook_error) {
              console.log(m.facebook_error);
            }
          }
        });
        facebook.worker.on('disconnect', () => {
          facebook.active = !facebook.active;
          console.log('Facebook worker exited');
        });
      }
    });
    socket.on('facebook_stop', () => {
      if (facebook.active && facebook.worker.kill) {
        facebook.worker.kill();
        io.sockets.emit('facebook_stop');
      }
    });
  });
};
