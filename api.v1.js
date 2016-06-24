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
        validate: {
          query: {
            country: Joi.string().min(1).max(10).optional(),
            region: Joi.string().min(1).max(10).optional(),
            city: Joi.string().min(1).max(10).required(),
            token: Joi.string().length(224).required(),
          },
        },
        handler(request, reply) {
          request.server.app.minsaitdb.query`
            SELECT	a.TargetID AS cd_pdv,
                    a.TargetName AS ds_pdv,
                    b.lat AS lat,
                    b.lon AS lon,
                    c.ESPECIALIDAD_IBC AS segmento,
                    e.statuses AS twitter_statuses,
					          f.usersCount AS foursquare_usercount,
                    a.targetProvincia AS region,
                    a.targetMunicipio AS city
            FROM ibc_seg.DM_MANPOWER_OUTPUT AS a
            LEFT JOIN ibc_seg.DM_MANPOWER_OUTPUT_LATLON AS b
            ON a.CallID = b.CallID
            LEFT JOIN ibc_seg.DM_MANPOWER_OUTPUT_ESPECIALIDAD_IBC AS c
            ON a.CallID = c.CallID
            LEFT JOIN ibc_seg.DM_PIVOTE_CRUZADOS_SOURCE AS d
            ON a.CallID = d.CallID
            LEFT JOIN ibc_seg.DM_SOURCE_TWITTER_LIST AS e
            ON d.idTwitter = e.screen_name
            LEFT JOIN ibc_seg.DM_SOURCE_FOURSQUARE_LIST as f
            ON d.id4Square = f.id
            WHERE a.targetMunicipio = ${request.query.city.toUpperCase()}`
          .then(recordset => reply(recordset))
          .catch(err => reply(err));
        },
      },
    },

  ]);

  return next();
};
