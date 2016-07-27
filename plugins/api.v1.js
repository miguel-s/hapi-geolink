'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['GeolinkAuthJwt'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'GeolinkApi',
};

exports.options = internals.options = {
  prefix: '/api/v1',
};

internals.after = (server, next) => {
  // Api routing

  server.route([
    // Token route
    {
      method: 'GET',
      path: `${internals.options.prefix}/token`,
      config: {
        description: 'Returns a jwt',
        auth: { strategy: 'geolink-session', mode: 'required' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler: require('../controllers/api_token.js'),
      },
    },

    // Map route
    {
      method: 'GET',
      path: `${internals.options.prefix}/map`,
      config: {
        description: 'Returns a topojson object with map and demographic data',
        auth: { strategy: 'geolink-token', mode: 'required' },
        validate: {
          query: {
            area: Joi.string().min(1).max(10).required(),
            name: Joi.string().min(1).max(10).required(),
            gran: Joi.string().min(1).max(10).required(),
            token: Joi.string().length(224).required(),
          },
        },
        handler: require('../controllers/api_map.js'),
      },
    },

    // Horeca route
    {
      method: 'GET',
      path: `${internals.options.prefix}/venues`,
      config: {
        description: 'Returns a json object with venue data',
        auth: { strategy: 'geolink-token', mode: 'required' },
        validate: {
          query: {
            area: Joi.string().min(1).max(10).optional(),
            name: Joi.string().min(1).max(10).optional(),
            limit: Joi.number().integer().positive().optional(),
            query: Joi.string().optional(),
            token: Joi.string().length(224).required(),
          },
        },
        handler: require('../controllers/api_venues.js'),
      },
    },

  ]);

  return next();
};
