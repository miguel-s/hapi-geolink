'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.register(
    [
      require('./auth-cookie'),
      require('./static'),
      require('./web'),
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
