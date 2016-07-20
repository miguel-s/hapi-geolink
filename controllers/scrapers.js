'use strict';

const Boom = require('boom');

module.exports = function handler(request, reply) {
  const pTwitter = request.server.app.minsaitdb.query`
    SELECT	COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_TWITTER_VENUES_RAW`;

  const pFacebook = request.server.app.minsaitdb.query`
    SELECT	COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_FACEBOOK_VENUES_RAW`;

  const pFoursquare = request.server.app.minsaitdb.query`
    SELECT	COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_FOURSQUARE_VENUES_RAW
    WHERE [id] NOT LIKE '%empty%'`;

  const pYelp = request.server.app.minsaitdb.query`
    SELECT	COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_YELP_VENUES_RAW
    WHERE [id] NOT LIKE '%empty%'`;

  const pTripadvisor = request.server.app.minsaitdb.query`
    SELECT	COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_TRIPADVISOR_VENUES_RAW`;

  const pMichelin = request.server.app.minsaitdb.query`
    SELECT	COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_MICHELIN_VENUES_RAW`;

  const pRepsol = request.server.app.minsaitdb.query`
    SELECT	COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_Repsol_VENUES_RAW`;

  Promise.all([pTwitter, pFacebook, pFoursquare, pYelp, pTripadvisor, pMichelin, pRepsol])
  .then((values) => {
    const twitter = values[0][0];
    const facebook = values[1][0];
    const foursquare = values[2][0];
    const yelp = values[3][0];
    const tripadvisor = values[4][0];
    const michelin = values[5][0];
    const repsol = values[6][0];
    return reply.view('scrapers', {
      twitter,
      facebook,
      foursquare,
      yelp,
      tripadvisor,
      michelin,
      repsol,
    });
  })
  .catch(error => reply(Boom.badImplementation()));
};