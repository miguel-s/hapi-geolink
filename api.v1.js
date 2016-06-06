'use strict';

const Boom = require('boom');
const jwt = require('jsonwebtoken');
const aguid = require('aguid');

const addPropsToMap = require('./helpers/funcs.js').addPropsToMap;
const data = require('./helpers/bootstrap.js')();

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['IbcAuthJwt'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'IbcApi',
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
        auth: { strategy: 'ibc-session', mode: 'required' },
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        handler(request, reply) {
          if (request.auth.isAuthenticated) {
            const token = jwt.sign(
              { iat: Math.floor(Date.now() / 1000), jti: aguid(), id: request.auth.credentials.id },
              process.env.JWT_SECRET
            );
            return reply(token);
          }
          return reply(Boom.unauthorized());
        },
      },
    },

    // Ccaa route
    {
      method: 'GET',
      path: `${internals.options.prefix}/ccaa`,
      config: {
        description: 'Returns a topojson object with map and demographic data',
        auth: { strategy: 'ibc-token', mode: 'required' },
        handler(request, reply) {
          return reply(addPropsToMap(data.map.ccaa, data.demographic.ccaa, 'CA'));
        },
      },
    },

    // Provincias route
    {
      method: 'GET',
      path: `${internals.options.prefix}/provincias`,
      config: {
        description: 'Returns a topojson object with map and demographic data',
        auth: { strategy: 'ibc-token', mode: 'required' },
        handler(request, reply) {
          return reply(addPropsToMap(data.map.provincias, data.demographic.provincias, 'CP'));
        },
      },
    },

    // Barrios madrid route
    {
      method: 'GET',
      path: `${internals.options.prefix}/barrios_madrid`,
      config: {
        description: 'Returns a topojson object with map and demographic data',
        auth: { strategy: 'ibc-token', mode: 'required' },
        handler(request, reply) {
          return reply(addPropsToMap(data.map.barrios.madrid, data.demographic.barrios.madrid, 'codbar'));
        },
      },
    },

    // Secciones censales madrid route
    {
      method: 'GET',
      path: `${internals.options.prefix}/secciones_censales_madrid`,
      config: {
        description: 'Returns a topojson object with map and demographic data',
        auth: { strategy: 'ibc-token', mode: 'required' },
        handler(request, reply) {
          return reply(addPropsToMap(data.map.secciones.madrid, data.demographic.secciones.madrid, 'CUSEC'));
        },
      },
    },

    // Horeca route
    {
      method: 'GET',
      path: `${internals.options.prefix}/horeca`,
      config: {
        description: 'Returns a topojson object with map and demographic data',
        auth: { strategy: 'ibc-token', mode: 'required' },
        handler(request, reply) {
          return reply(data.venues.horeca);
        },
      },
    },

  ]);

  return next();
};
