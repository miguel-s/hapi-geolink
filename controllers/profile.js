'use strict';

module.exports = function handler(request, reply) {
  const user = {};

  if (request.auth.isAuthenticated) {
    user.id = request.auth.credentials.id;
    user.username = request.auth.credentials.username;
    user.email = request.auth.credentials.email;
    user.token = request.auth.credentials.token;
    return reply.view('profile', { user });
  }
  return reply.redirect('/login');
};
