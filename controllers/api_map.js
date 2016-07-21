'use strict';

const Boom = require('boom');

module.exports = function handler(request, reply) {
  const sql = request.server.app.minsaitdb;

  sql.query`
    SELECT topojson
    FROM ibc_seg.DM_SOURCE_MAPS
    WHERE area = ${request.query.area}
          AND name = ${request.query.name}
          AND gran = ${request.query.gran}
          AND q = 'q1e4'
          AND sp = 'sp25'`
  .then(recordset => {
    if (recordset.length === 0) return reply(Boom.notFound());
    if (recordset.length > 1) return reply(Boom.badRequest());
    return reply(JSON.parse(recordset[0].topojson));
  })
  .catch(err => reply(err));
};
