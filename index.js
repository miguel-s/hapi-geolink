'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.register(
    [
      require('./plugins/database-csa.js'),
      require('./plugins/auth-cookie.js'),
      require('./plugins/auth-jwt.js'),
      require('./plugins/static.js'),
      require('./plugins/web.js'),
      require('./plugins/api.v1.js'),
      require('./plugins/socketio.js'),
      require('./plugins/db-admin.js'),
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
