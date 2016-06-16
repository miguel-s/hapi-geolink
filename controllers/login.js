'use strict';

const aguid = require('aguid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = function handler(request, reply, source, error) {
  let account = {};

  if (request.auth.isAuthenticated) {
    return reply.redirect('/');
  }

  if (!request.payload.email || !request.payload.password) {
    return reply.view('login', {
      message: 'Missing email or password',
      email: request.payload.email,
    });
  }

  // Joi error handling -> only check and display email error
  if (error && error.data) {
    if (error.data.details[0].path === 'email') {
      return reply.view('login', {
        message: 'Must be a valid email', // error.data.details[0].message,
        email: request.payload.email,
      });
    }
  }

  request.server.app.db.get('SELECT * FROM Users WHERE email = ?', request.payload.email,
    (err, row) => {
      if (err) return reply(err);

      if (!row) {
        return reply.view('login', {
          message: 'Invalid email or password',
          email: request.payload.email,
        });
      }

      bcrypt.compare(request.payload.password, row.password, (err, res) => {
        if (err) return reply(err);

        if (!res) {
          return reply.view('login', {
            message: 'Invalid email or password',
            email: request.payload.email,
          });
        }

        account = Object.assign(account, row, { scope: row.scope.split(', ') });
        account.token = jwt.sign(
          { iat: Math.floor(Date.now() / 1000), jti: aguid(), id: row.id },
          process.env.JWT_SECRET
        );
        if (account.password) delete account.password; // don't save pw in cookie
        const sid = String(aguid());
        request.server.app.cache.set(sid, { account }, 0, (err) => {
          if (err) return reply(err);

          request.cookieAuthIbc.set({ sid });

          const next = request.payload.next || '/';
          if (account.scope.indexOf('admin') !== -1) return reply.redirect(next);
          return reply.redirect(next);
        });
      });
    }
  );
};
