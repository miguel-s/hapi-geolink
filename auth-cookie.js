'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['hapi-auth-cookie'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'IbcAuthCookie',
};

exports.options = internals.options = {
  cacheOptions: { segment: 'ibc-sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 },
  password: process.env.COOKIE_SECRET,
  cookie: 'ibc-sid',
  redirectTo: '/ibc/login',
  isSecure: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'),
  isHttpOnly: false,
  requestDecoratorName: 'cookieAuthIbc',
};

internals.after = (server, next) => {
  const cache = server.cache(internals.options.cacheOptions);
  server.app.cache = cache;

  server.auth.strategy('ibc-session', 'cookie', false, {
    password: internals.options.password, // must be length 32 hapi v13 requirement.
    cookie: internals.options.cookie,
    redirectTo: internals.options.redirectTo,
    isSecure: internals.options.isSecure,
    isHttpOnly: internals.options.isHttpOnly,
    requestDecoratorName: internals.options.requestDecoratorName,
    validateFunc: (request, session, callback) => {
      server.app.cache.get(session.sid, (err, cached) => {
        if (err) return callback(err, false);

        // session expired exception.
        if (!cached) return callback(null, false);

        return callback(null, true, cached.account);
      });
    },
  });

  return next();
};
