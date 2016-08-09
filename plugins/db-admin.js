'use strict';

const internals = {};

exports.register = (server, options, next) => {
  server.dependency(['GeolinkAuthCookie'], internals.after);
  return next();
};

exports.register.attributes = {
  name: 'GeolinkDbAdmin',
};

exports.options = internals.options = {
  prefix: '/dbadmin',
};

internals.after = (server, next) => {
  server.route([
    {
      method: 'GET',
      path: `${internals.options.prefix}/head/{table}`,
      config: {
        description: 'Returns top10 results of a table',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: (request, reply) => {
          const sql = request.server.app.minsaitdb;
          new sql.Request()
          .query(`SELECT TOP 10 * FROM ibc_seg.DM_SOURCE_${request.params.table}_VENUES_RAW`)
          .then(rows => reply(rows))
          .catch(error => reply(error));
        },
      },
    },
    {
      method: 'GET',
      path: `${internals.options.prefix}/distinct/{table}/{column}`,
      config: {
        description: 'Get distinct values from a column in a table',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: (request, reply) => {
          const sql = request.server.app.minsaitdb;
          new sql.Request()
          .query(`SELECT DISTINCT ${request.params.column} FROM ibc_seg.DM_SOURCE_${request.params.table}_VENUES_RAW ORDER BY 1`)
          .then(rows => reply(rows))
          .catch(error => reply(error));
        },
      },
    },
    {
      method: 'GET',
      path: `${internals.options.prefix}/integrity/{table}`,
      config: {
        description: 'Get malformed rows from table',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: (request, reply) => {
          const sql = request.server.app.minsaitdb;
          new sql.Request()
          .query(`SELECT * FROM ibc_seg.DM_SOURCE_${request.params.table}_VENUES_RAW WHERE [datetime] NOT LIKE '%2016%'`)
          .then(rows => reply(rows))
          .catch(error => reply(error));
        },
      },
    },
    {
      method: 'GET',
      path: `${internals.options.prefix}/truncate/{table}`,
      config: {
        description: 'Truncates table',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: (request, reply) => {
          const sql = request.server.app.minsaitdb;
          new sql.Request()
          .query(`TRUNCATE TABLE ibc_seg.DM_SOURCE_${request.params.table}_VENUES_RAW`)
          .then(() => reply('success'))
          .catch(error => reply(error));
        },
      },
    },
    {
      method: 'GET',
      path: `${internals.options.prefix}/drop/{table}`,
      config: {
        description: 'Drops table',
        auth: { strategy: 'geolink-session', mode: 'try' },
        plugins: { 'hapi-auth-cookie': { redirectTo: '/login' } },
        handler: (request, reply) => {
          const sql = request.server.app.minsaitdb;
          new sql.Request()
          .query(`DROP TABLE ibc_seg.DM_SOURCE_${request.params.table}_VENUES_RAW`)
          .then(() => reply('success'))
          .catch(error => reply(error));
        },
      },
    },
  ]);

  return next();
};
