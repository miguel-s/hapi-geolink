'use strict';

const Boom = require('boom');

module.exports = function handler(request, reply) {
  const pFoursquare = request.server.app.minsaitdb.query`
    SELECT	COUNT(distinct [id]) as distinct_id,
            MAX(CAST([datetime] as datetime)) as max_datetime
    FROM ibc_seg.DM_SOURCE_FOURSQUARE_RAW`;

  const pYelp = request.server.app.minsaitdb.query`
    SELECT	COUNT(distinct [id]) as distinct_id,
            MAX(CAST([datetime] as datetime)) as max_datetime
    FROM ibc_seg.DM_SOURCE_YELP_RAW`;

  Promise.all([pFoursquare, pYelp])
  .then((values) => {
    const foursquare = values[0][0];
    const yelp = values[1][0];
    return reply.view('dashboard', { foursquare, yelp });
  })
  .catch(error => reply(Boom.badImplementation()));
};
