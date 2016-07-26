'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['hapi-auth-jwt2', 'Database'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'IbcAuthJwt',
};

exports.options = internals.options = {
  key: process.env.JWT_SECRET,
};

internals.after = (server, next) => {
  server.auth.strategy('ibc-token', 'jwt', false, {
    key: internals.options.key,
    verifyOptions: { algorithms: ['HS256'] },  // only allow HS256 algorithm
    validateFunc: (decoded, request, callback) => {
      request.server.app.db.get('SELECT id FROM Users WHERE id = ?', decoded.id,
        (err, row) => {
          if (err) return callback(err, false);
          if (!row) return callback(null, false);
          return callback(null, true);
        }
      );
    },
  });

  return next();
};
