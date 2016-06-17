'use strict';

const Joi = require('joi');
const Boom = require('boom');
const jwt = require('jsonwebtoken');
const aguid = require('aguid');

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

    // Map route
    {
      method: 'GET',
      path: `${internals.options.prefix}/map`,
      config: {
        description: 'Returns a topojson object with map and demographic data',
        auth: { strategy: 'ibc-token', mode: 'required' },
        validate: {
          query: {
            country: Joi.string().min(3).max(10).required(),
            region: Joi.string().min(3).max(10).required(),
            city: Joi.string().min(3).max(10).required(),
            granularity: Joi.string().min(3).max(10).required(),
            q: Joi.string().length(4).required(),
            sp: Joi.string().min(3).max(5).required(),
            token: Joi.string().length(224).required(),
          },
        },
        handler(request, reply) {
          request.server.app.minsaitdb.query`
            SELECT topojson
            FROM ibc_seg.DM_SOURCE_MAPS
            WHERE country = ${request.query.country}
                  AND region = ${request.query.region}
                  AND city = ${request.query.city}
                  AND granularity = ${request.query.granularity}
                  AND q = ${request.query.q}
                  AND sp = ${request.query.sp}`
          .then(recordset => JSON.parse(recordset[0].topojson))
          .then(map => reply(map))
          .catch(err => reply(err));
        },
      },
    },

    // Horeca route
    {
      method: 'GET',
      path: `${internals.options.prefix}/venues`,
      config: {
        description: 'Returns a json object with venue data',
        auth: { strategy: 'ibc-token', mode: 'required' },
        handler(request, reply) {
          request.server.app.minsaitdb.query`
            SELECT	a.TargetID as cd_pdv,
                    a.TargetName as ds_pdv,
                    b.lat as lat,
                    b.lon as lon,
                    c.ESPECIALIDAD_IBC as segmento
            FROM ibc_seg.DM_MANPOWER_OUTPUT as a
            left join ibc_seg.DM_MANPOWER_OUTPUT_LATLON as b
            on a.CallID = b.CallID
            left join ibc_seg.DM_MANPOWER_OUTPUT_ESPECIALIDAD_IBC as c
            on a.CallID = c.CallID`
          .then(recordset => reply(recordset))
          .catch(err => reply(err));
        },
      },
    },

  ]);

  return next();
};
