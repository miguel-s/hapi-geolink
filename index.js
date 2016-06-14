'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.register(
    [
      require('./database-csa.js'),
      require('./auth-cookie.js'),
      require('./auth-jwt.js'),
      require('./static.js'),
      require('./web.js'),
      require('./api.v1.js'),
      require('./socketio.js'),
    ],
    (err) => {
      if (err) return next(err);
      return next();
    }
  );
};

exports.register.attributes = {
  pkg: require('./package.json'),
};

exports.options = internals.options = {

};
