'use strict';

module.exports = function handler(request, reply) {
  request.cookieAuthIbc.clear();
  return reply.redirect('/');
};
