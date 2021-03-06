'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['vision', 'GeolinkAuthCookie'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'GeolinkWeb',
};

internals.after = (server, next) => {
  server.views({
    engines: {
      jade: {
        module: require('jade'),
        // set 'false' for development! set 'true' for production!
        isCached: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'),
      },
    },
    relativeTo: __dirname,
    path: '../views',
  });

  // Web routing
  server.route([
    // Index route
    {
      method: 'GET',
      path: '/',
      config: {
        description: 'Returns the index page',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: {
          view: {
            template: 'index',
          },
        },
      },
    },

    // Login route
    {
      method: 'GET',
      path: '/login',
      config: {
        description: 'Returns a login form',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler: {
          view: {
            template: 'login',
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/login',
      config: {
        description: 'Returns a login form',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        validate: {
          payload: require('../models/user.js'),
          failAction: require('../controllers/login.js'),
        },
        handler: require('../controllers/login.js'),
      },
    },

    // Logout route
    {
      method: 'GET',
      path: '/logout',
      config: {
        description: 'Logout user',
        handler: require('../controllers/logout.js'),
      },
    },

    // Signup route
    {
      method: 'GET',
      path: '/signup',
      config: {
        description: 'Returns a sinup form',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler: {
          view: {
            template: 'signup',
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/signup',
      config: {
        description: 'Returns a sinup form',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        validate: {
          payload: require('../models/user.js'),
          failAction: require('../controllers/signup.js'),
        },
        handler: require('../controllers/signup.js'),
      },
    },

    // Venues route
    {
      method: 'GET',
      path: '/venues',
      config: {
        description: 'Returns the venues page',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: {
          view: {
            template: 'venues',
          },
        },
      },
    },

    // Scrapers route
    {
      method: 'GET',
      path: '/scrapers',
      config: {
        description: 'Returns the scrapers page',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: require('../controllers/scrapers.js'),
      },
    },

    // Profile route
    {
      method: 'GET',
      path: '/profile',
      config: {
        description: 'Returns the profile page',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: require('../controllers/profile.js'),
      },
    },

    // Cookies route
    {
      method: 'GET',
      path: '/cookies',
      config: {
        description: 'Returns the cookies policy page',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: {
          view: {
            template: 'cookies',
          },
        },
      },
    },

    // Admin route
    {
      method: 'GET',
      path: '/admin',
      config: {
        description: 'Returns the admin control panel',
        auth: { strategy: 'geolink-session', mode: 'try', scope: ['admin'] },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: {
          view: {
            template: 'admin',
          },
        },
      },
    },
  ]);

  return next();
};
