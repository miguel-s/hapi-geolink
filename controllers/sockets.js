'use strict';

const path = require('path');
const fork = require('child_process').fork;
const socketioJwt = require('socketio-jwt');

const foursquare = {
  venues: {
    worker: null,
    active: false,
    progress: 0,
  },
};
const yelp = {
  venues: {
    worker: null,
    active: false,
    progress: 0,
  },
};
const twitter = {
  venues: {
    worker: null,
    active: false,
    progress: 0,
  },
};
const facebook = {
  venues: {
    worker: null,
    active: false,
    progress: 0,
  },
};
const tripadvisor = {
  list: {
    worker: null,
    active: false,
    progress: 0,
  },
  venues: {
    worker: null,
    active: false,
    progress: 0,
  },
};

module.exports = function sockets(io) {
  io.use(socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    handshake: true,
  }));
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.decoded_token.id}`);

    if (foursquare.venues.active) {
      socket.emit('foursquare_start');
      socket.emit('foursquare_progress', foursquare.venues.progress);
    }
    if (yelp.venues.active) {
      socket.emit('yelp_start');
      socket.emit('yelp_progress', yelp.venues.progress);
    }
    if (twitter.venues.active) {
      socket.emit('twitter_start');
      socket.emit('twitter_progress', twitter.venues.progress);
    }
    if (facebook.venues.active) {
      socket.emit('facebook_start');
      socket.emit('facebook_progress', facebook.venues.progress);
    }
    if (tripadvisor.list.active) {
      socket.emit('tripadvisor_list_start');
      socket.emit('tripadvisor_list_progress', tripadvisor.list.progress);
    }
    if (tripadvisor.venues.active) {
      socket.emit('tripadvisor_start');
      socket.emit('tripadvisor_progress', tripadvisor.venues.progress);
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.decoded_token.id}`);
    });

    // FOURSQUARE
    socket.on('foursquare_start', () => {
      if (!foursquare.venues.active) {
        foursquare.venues.active = !foursquare.venues.active;
        io.sockets.emit('foursquare_start');
        foursquare.venuesworker = fork(path.join(__dirname, '../workers/foursquare/foursquare.js'));
        console.log('Foursquare worker started');
        foursquare.venuesworker.on('message', (m) => {
          if (m === 'foursquare_stop') {
            io.sockets.emit('foursquare_stop');
          } else {
            if (m.foursquare_progress) {
              foursquare.venuesprogress = m.foursquare_progress;
              io.sockets.emit('foursquare_progress', foursquare.venuesprogress);
            }
            if (m.foursquare_error) {
              console.log(m.foursquare_error);
            }
          }
        });
        foursquare.venuesworker.on('disconnect', () => {
          foursquare.venues.active = !foursquare.venues.active;
          console.log('Foursquare worker exited');
        });
      }
    });
    socket.on('foursquare_stop', () => {
      if (foursquare.venues.active && foursquare.venuesworker.kill) {
        foursquare.venuesworker.kill();
        io.sockets.emit('foursquare_stop');
      }
    });

    // YELP
    socket.on('yelp_start', () => {
      if (!yelp.venues.active) {
        yelp.venues.active = !yelp.venues.active;
        io.sockets.emit('yelp_start');
        yelp.venues.worker = fork(path.join(__dirname, '../workers/yelp/yelp.js'));
        console.log('Yelp worker started');
        yelp.venues.worker.on('message', (m) => {
          if (m === 'yelp_stop') {
            io.sockets.emit('yelp_stop');
          } else {
            if (m.yelp_progress) {
              yelp.venues.progress = m.yelp_progress;
              io.sockets.emit('yelp_progress', yelp.venues.progress);
            }
            if (m.yelp_error) {
              console.log(m.yelp_error);
            }
          }
        });
        yelp.venues.worker.on('disconnect', () => {
          yelp.venues.active = !yelp.venues.active;
          console.log('Yelp worker exited');
        });
      }
    });
    socket.on('yelp_stop', () => {
      if (yelp.venues.active && yelp.venues.worker.kill) {
        yelp.venues.worker.kill();
        io.sockets.emit('yelp_stop');
      }
    });

    // TWITTER
    socket.on('twitter_start', () => {
      if (!twitter.venues.active) {
        twitter.venues.active = !twitter.venues.active;
        io.sockets.emit('twitter_start');
        twitter.venues.worker = fork(path.join(__dirname, '../workers/twitter/twitter.js'));
        console.log('Twitter worker started');
        twitter.venues.worker.on('message', (m) => {
          if (m === 'twitter_stop') {
            io.sockets.emit('twitter_stop');
          } else {
            if (m.twitter_progress) {
              twitter.venues.progress = Math.floor(m.twitter_progress / 100); // dive by 100 as a lazy quick fix for chunk length
              io.sockets.emit('twitter_progress', twitter.venues.progress);
            }
            if (m.twitter_error) {
              console.log(m.twitter_error);
            }
          }
        });
        twitter.venues.worker.on('disconnect', () => {
          twitter.venues.active = !twitter.venues.active;
          console.log('Twitter worker exited');
        });
      }
    });
    socket.on('twitter_stop', () => {
      if (twitter.venues.active && twitter.venues.worker.kill) {
        twitter.venues.worker.kill();
        io.sockets.emit('twitter_stop');
      }
    });

    // FACEBOOK
    socket.on('facebook_start', () => {
      if (!facebook.venues.active) {
        facebook.venues.active = !facebook.venues.active;
        io.sockets.emit('facebook_start');
        facebook.venues.worker = fork(path.join(__dirname, '../workers/facebook/facebook.js'));
        console.log('Facebook worker started');
        facebook.venues.worker.on('message', (m) => {
          if (m === 'facebook_stop') {
            io.sockets.emit('facebook_stop');
          } else {
            if (m.facebook_progress) {
              facebook.venues.progress = m.facebook_progress;
              io.sockets.emit('facebook_progress', facebook.venues.progress);
            }
            if (m.facebook_error) {
              console.log(m.facebook_error);
            }
          }
        });
        facebook.venues.worker.on('disconnect', () => {
          facebook.venues.active = !facebook.venues.active;
          console.log('Facebook worker exited');
        });
      }
    });
    socket.on('facebook_stop', () => {
      if (facebook.venues.active && facebook.venues.worker.kill) {
        facebook.venues.worker.kill();
        io.sockets.emit('facebook_stop');
      }
    });

    // TRIPADVISOR
    socket.on('tripadvisor_list_start', () => {
      if (!tripadvisor.list.active && !tripadvisor.venues.active) {
        tripadvisor.list.active = !tripadvisor.list.active;
        io.sockets.emit('tripadvisor_list_start');
        tripadvisor.list.worker = fork(path.join(__dirname, '../workers/tripadvisor/tripadvisor_list.js'));
        console.log('Tripadvisor List worker started');
        tripadvisor.list.worker.on('message', (m) => {
          if (m === 'tripadvisor_list_stop') {
            io.sockets.emit('tripadvisor_list_stop');
          } else {
            if (m.tripadvisor_progress) {
              tripadvisor.list.progress = m.tripadvisor_progress;
              io.sockets.emit('tripadvisor_list_progress', tripadvisor.list.progress);
            }
            if (m.tripadvisor_error) {
              console.log(m.tripadvisor_error);
            }
          }
        });
        tripadvisor.list.worker.on('disconnect', () => {
          tripadvisor.list.active = !tripadvisor.list.active;
          console.log('Tripadvisor List worker exited');
        });
      }
    });
    socket.on('tripadvisor_list_stop', () => {
      if (tripadvisor.list.active && tripadvisor.list.worker.kill) {
        tripadvisor.list.worker.kill();
        io.sockets.emit('tripadvisor_list_stop');
      }
    });

    socket.on('tripadvisor_start', () => {
      if (!tripadvisor.venues.active && !tripadvisor.list.active) {
        tripadvisor.venues.active = !tripadvisor.venues.active;
        io.sockets.emit('tripadvisor_start');
        tripadvisor.venues.worker = fork(path.join(__dirname, '../workers/tripadvisor/tripadvisor.js'));
        console.log('Tripadvisor worker started');
        tripadvisor.venues.worker.on('message', (m) => {
          if (m === 'tripadvisor_stop') {
            io.sockets.emit('tripadvisor_stop');
          } else {
            if (m.tripadvisor_progress) {
              tripadvisor.venues.progress = m.tripadvisor_progress;
              io.sockets.emit('tripadvisor_progress', tripadvisor.venues.progress);
            }
            if (m.tripadvisor_error) {
              console.log(m.tripadvisor_error);
            }
          }
        });
        tripadvisor.venues.worker.on('disconnect', () => {
          tripadvisor.venues.active = !tripadvisor.venues.active;
          console.log('Tripadvisor worker exited');
        });
      }
    });
    socket.on('tripadvisor_stop', () => {
      if (tripadvisor.venues.active && tripadvisor.venues.worker.kill) {
        tripadvisor.venues.worker.kill();
        io.sockets.emit('tripadvisor_stop');
      }
    });
  });
};
