'use strict';

const path = require('path');
const fork = require('child_process').fork;
const socketioJwt = require('socketio-jwt');

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
const michelin = {
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
const repsol = {
  listPages: {
    worker: null,
    active: false,
    progress: 0,
  },
  listRestaurants: {
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

    if (twitter.venues.active) {
      socket.emit('twitter_start');
      socket.emit('twitter_progress', twitter.venues.progress);
    }
    if (facebook.venues.active) {
      socket.emit('facebook_start');
      socket.emit('facebook_progress', facebook.venues.progress);
    }
    if (foursquare.venues.active) {
      socket.emit('foursquare_start');
      socket.emit('foursquare_progress', foursquare.venues.progress);
    }
    if (yelp.venues.active) {
      socket.emit('yelp_start');
      socket.emit('yelp_progress', yelp.venues.progress);
    }
    if (tripadvisor.list.active) {
      socket.emit('tripadvisor_list_start');
      socket.emit('tripadvisor_list_progress', tripadvisor.list.progress);
    }
    if (tripadvisor.venues.active) {
      socket.emit('tripadvisor_start');
      socket.emit('tripadvisor_progress', tripadvisor.venues.progress);
    }
    if (michelin.list.active) {
      socket.emit('michelin_list_start');
      socket.emit('michelin_list_progress', michelin.list.progress);
    }
    if (michelin.venues.active) {
      socket.emit('michelin_start');
      socket.emit('michelin_progress', michelin.venues.progress);
    }
    if (repsol.listPages.active) {
      socket.emit('repsol_list_pages_start');
      socket.emit('repsol_list_pages_progress', repsol.listPages.progress);
    }
    if (repsol.listRestaurants.active) {
      socket.emit('repsol_list_restaurants_start');
      socket.emit('repsol_list_restaurants_progress', repsol.listRestaurants.progress);
    }
    if (repsol.venues.active) {
      socket.emit('repsol_start');
      socket.emit('repsol_progress', repsol.venues.progress);
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.decoded_token.id}`);
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
              twitter.venues.progress = Math.floor(m.twitter_progress / 100); // divide by 100 as a lazy quick fix for chunk length
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

    // MICHELIN
    socket.on('michelin_list_start', () => {
      if (!michelin.list.active && !michelin.venues.active) {
        michelin.list.active = !michelin.list.active;
        io.sockets.emit('michelin_list_start');
        michelin.list.worker = fork(path.join(__dirname, '../workers/michelin/michelin_list.js'));
        console.log('Michelin List worker started');
        michelin.list.worker.on('message', (m) => {
          if (m === 'michelin_list_stop') {
            io.sockets.emit('michelin_list_stop');
          } else {
            if (m.michelin_progress) {
              michelin.list.progress = m.michelin_progress;
              io.sockets.emit('michelin_list_progress', michelin.list.progress);
            }
            if (m.michelin_error) {
              console.log(m.michelin_error);
            }
          }
        });
        michelin.list.worker.on('disconnect', () => {
          michelin.list.active = !michelin.list.active;
          console.log('Michelin List worker exited');
        });
      }
    });
    socket.on('michelin_list_stop', () => {
      if (michelin.list.active && michelin.list.worker.kill) {
        michelin.list.worker.kill();
        io.sockets.emit('michelin_list_stop');
      }
    });

    socket.on('michelin_start', () => {
      if (!michelin.venues.active && !michelin.list.active) {
        michelin.venues.active = !michelin.venues.active;
        io.sockets.emit('michelin_start');
        michelin.venues.worker = fork(path.join(__dirname, '../workers/michelin/michelin.js'));
        console.log('Michelin worker started');
        michelin.venues.worker.on('message', (m) => {
          if (m === 'michelin_stop') {
            io.sockets.emit('michelin_stop');
          } else {
            if (m.michelin_progress) {
              michelin.venues.progress = Math.floor(m.michelin_progress / 25); // divide by 25 as a lazy quick fix for chunk length
              io.sockets.emit('michelin_progress', michelin.venues.progress);
            }
            if (m.michelin_error) {
              console.log(m.michelin_error);
            }
          }
        });
        michelin.venues.worker.on('disconnect', () => {
          michelin.venues.active = !michelin.venues.active;
          console.log('Michelin worker exited');
        });
      }
    });
    socket.on('michelin_stop', () => {
      if (michelin.venues.active && michelin.venues.worker.kill) {
        michelin.venues.worker.kill();
        io.sockets.emit('michelin_stop');
      }
    });

    // REPSOL
    socket.on('repsol_list_pages_start', () => {
      if (!repsol.listPages.active && !repsol.listRestaurants.active && !repsol.venues.active) {
        repsol.listPages.active = !repsol.listPages.active;
        io.sockets.emit('repsol_list_pages_start');
        repsol.listPages.worker = fork(path.join(__dirname, '../workers/repsol/repsol_list_pages.js'));
        console.log('Repsol List Pages worker started');
        repsol.listPages.worker.on('message', (m) => {
          if (m === 'repsol_list_pages_stop') {
            io.sockets.emit('repsol_list_pages_stop');
          } else {
            if (m.repsol_progress) {
              repsol.listPages.progress = m.repsol_progress;
              io.sockets.emit('repsol_list_pages_progress', repsol.listPages.progress);
            }
            if (m.repsol_error) {
              console.log(m.repsol_error);
            }
          }
        });
        repsol.listPages.worker.on('disconnect', () => {
          repsol.listPages.active = !repsol.listPages.active;
          console.log('Repsol List Pages worker exited');
        });
      }
    });
    socket.on('repsol_list_pages_stop', () => {
      if (repsol.listPages.active && repsol.listPages.worker.kill) {
        repsol.listPages.worker.kill();
        io.sockets.emit('repsol_list_pages_stop');
      }
    });

    socket.on('repsol_list_restaurants_start', () => {
      if (!repsol.listPages.active && !repsol.listRestaurants.active && !repsol.venues.active) {
        repsol.listRestaurants.active = !repsol.listRestaurants.active;
        io.sockets.emit('repsol_list_restaurants_start');
        repsol.listRestaurants.worker = fork(path.join(__dirname, '../workers/repsol/repsol_list_restaurants.js'));
        console.log('Repsol List Restaurants worker started');
        repsol.listRestaurants.worker.on('message', (m) => {
          if (m === 'repsol_list_restaurants_stop') {
            io.sockets.emit('repsol_list_restaurants_stop');
          } else {
            if (m.repsol_progress) {
              repsol.listRestaurants.progress = m.repsol_progress;
              io.sockets.emit('repsol_list_restaurants_progress', repsol.listRestaurants.progress);
            }
            if (m.repsol_error) {
              console.log(m.repsol_error);
            }
          }
        });
        repsol.listRestaurants.worker.on('disconnect', () => {
          repsol.listRestaurants.active = !repsol.listRestaurants.active;
          console.log('Repsol List Restaurants worker exited');
        });
      }
    });
    socket.on('repsol_list_restaurants_stop', () => {
      if (repsol.listRestaurants.active && repsol.listRestaurants.worker.kill) {
        repsol.listRestaurants.worker.kill();
        io.sockets.emit('repsol_list_restaurants_stop');
      }
    });

    socket.on('repsol_start', () => {
      if (!repsol.listPages.active && !repsol.listRestaurants.active && !repsol.venues.active) {
        repsol.venues.active = !repsol.venues.active;
        io.sockets.emit('repsol_start');
        repsol.venues.worker = fork(path.join(__dirname, '../workers/repsol/repsol.js'));
        console.log('Repsol worker started');
        repsol.venues.worker.on('message', (m) => {
          if (m === 'repsol_stop') {
            io.sockets.emit('repsol_stop');
          } else {
            if (m.repsol_progress) {
              repsol.venues.progress = m.repsol_progress;
              io.sockets.emit('repsol_progress', repsol.venues.progress);
            }
            if (m.repsol_error) {
              console.log(m.repsol_error);
            }
          }
        });
        repsol.venues.worker.on('disconnect', () => {
          repsol.venues.active = !repsol.venues.active;
          console.log('Repsol worker exited');
        });
      }
    });
    socket.on('repsol_stop', () => {
      if (repsol.venues.active && repsol.venues.worker.kill) {
        repsol.venues.worker.kill();
        io.sockets.emit('repsol_stop');
      }
    });
  });
};
