'use strict';

const Boom = require('boom');

module.exports = function handler(request, reply) {
  request.server.app.minsaitdb.query`
    SELECT  TOP 100
            [CD_PDV] AS [id],
            [DS_PDV] AS [name]
    FROM ibc_seg.HC_MANPOWER_informe`

  .then((venues) => reply.view('venues', { venues }))
  .catch(error => reply(Boom.badImplementation()));
};
