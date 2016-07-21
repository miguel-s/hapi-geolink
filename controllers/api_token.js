'use strict';

const jwt = require('jsonwebtoken');
const aguid = require('aguid');
const Boom = require('boom');

module.exports = function handler(request, reply) {
  if (request.auth.isAuthenticated) {
    const token = jwt.sign(
      { iat: Math.floor(Date.now() / 1000), jti: aguid(), id: request.auth.credentials.id },
      process.env.JWT_SECRET
    );
    return reply(token);
  }
  return reply(Boom.unauthorized());
};
