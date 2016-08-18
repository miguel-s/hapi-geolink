'use strict';

const Boom = require('boom');

module.exports = function handler(request, reply) {
  request.server.app.minsaitdb.query`
    SELECT	'twitter' AS [source],
            COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_TWITTER_VENUES_RAW
    UNION ALL
    SELECT	'facebook' AS [source],
            COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_FACEBOOK_VENUES_RAW
    UNION ALL
    SELECT	'foursquare' AS [source],
            COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_FOURSQUARE_VENUES_RAW
    WHERE [id] NOT LIKE '%empty%'
    UNION ALL
    SELECT	'yelp' AS [source],
            COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_YELP_VENUES_RAW
    WHERE [id] NOT LIKE '%empty%'
    UNION ALL
    SELECT	'tripadvisor' AS [source],
            COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_TRIPADVISOR_VENUES_RAW
    UNION ALL
    SELECT	'michelin' AS [source],
            COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_MICHELIN_VENUES_RAW
    UNION ALL
    SELECT	'repsol' AS [source],
            COUNT(DISTINCT [id]) AS [distinct_id],
            MAX(CAST([datetime] AS [datetime])) AS [max_datetime]
    FROM ibc_seg.DM_SOURCE_Repsol_VENUES_RAW`
  .then((rows) => reply.view('scrapers', {
    sources: rows.reduce((prev, curr) => Object.assign({}, prev, { [curr.source]: curr }), {}),
  }))
  .catch(error => reply(Boom.badImplementation()));
};
