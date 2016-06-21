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

  const pTwitter = request.server.app.minsaitdb.query`
    SELECT	COUNT(distinct [id]) as distinct_id,
            MAX(CAST([datetime] as datetime)) as max_datetime
    FROM ibc_seg.DM_SOURCE_TWITTER_RAW`;

  const pFacebook = request.server.app.minsaitdb.query`
    SELECT	COUNT(distinct [id]) as distinct_id,
            MAX(CAST([datetime] as datetime)) as max_datetime
    FROM ibc_seg.DM_SOURCE_FACEBOOK_RAW`;

  Promise.all([pFoursquare, pYelp, pTwitter, pFacebook])
  .then((values) => {
    const foursquare = values[0][0];
    const yelp = values[1][0];
    const twitter = values[2][0];
    const facebook = values[3][0];
    return reply.view('dashboard', { foursquare, yelp, twitter, facebook });
  })
  .catch(error => reply(Boom.badImplementation()));
};
