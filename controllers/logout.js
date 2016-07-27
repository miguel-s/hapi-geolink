'use strict';

module.exports = function handler(request, reply) {
  request.cookieAuthGeolink.clear();
  return reply.redirect('/');
};
