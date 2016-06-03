'use strict';

const path = require('path');

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['inert', 'IbcAuthCookie'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'IbcStatic',
};

internals.after = (server, next) => {
  // Routing for static files

  server.route([
    // Images
    {
      method: 'GET',
      path: '/img/{path*}',
      config: {
        description: 'Static image assets.',
        auth: { strategy: 'ibc-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler: {
          directory: {
            path: path.join(__dirname, 'public/img'),
          },
        },
      },
    },

    // Scripts
    {
      method: 'GET',
      path: '/js/{path*}',
      config: {
        description: 'Static js scripts assets.',
        auth: { strategy: 'ibc-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler: {
          directory: {
            path: path.join(__dirname, 'public/js'),
          },
        },
      },
    },

    // Styles
    {
      method: 'GET',
      path: '/css/{path*}',
      config: {
        description: 'Stylesheet static assets.',
        auth: { strategy: 'ibc-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler: {
          directory: {
            path: path.join(__dirname, 'public/css'),
          },
        },
      },
    },

    // Libs
    {
      method: 'GET',
      path: '/libs/{path*}',
      config: {
        description: 'Stylesheet static assets.',
        auth: { strategy: 'ibc-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler: {
          directory: {
            path: path.join(__dirname, 'public/libs'),
          },
        },
      },
    },
  ]);

  return next();
};
