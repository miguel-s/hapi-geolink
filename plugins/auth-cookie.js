'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['hapi-auth-cookie'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'GeolinkAuthCookie',
};

exports.options = internals.options = {
  cacheOptions: { segment: 'geolink-sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 },
  password: process.env.COOKIE_SECRET,
  cookie: 'geolink-sid',
  redirectTo: '/login',
  appendNext: true,
  isSecure: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'),
  requestDecoratorName: 'cookieAuthGeolink',
};

internals.after = (server, next) => {
  const cache = server.cache(internals.options.cacheOptions);
  server.app.cache = cache;

  server.auth.strategy('geolink-session', 'cookie', false, {
    password: internals.options.password, // must be length 32 hapi v13 requirement.
    cookie: internals.options.cookie,
    redirectTo: internals.options.redirectTo,
    appendNext: internals.options.appendNext,
    isSecure: internals.options.isSecure,
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
