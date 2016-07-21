'use strict';

const Boom = require('boom');

module.exports = function handler(request, reply) {
  const sql = request.server.app.minsaitdb;
  let area = '';
  switch (request.query.area) {
    case 'ccaa': {
      break;
    }
    case 'province': {
      area = 'a.targetProvincia';
      break;
    }
    case 'city': {
      area = 'a.targetMunicipio';
      break;
    }
    default: {
      break;
    }
  }
  if (!area) return reply(Boom.badRequest());

  const query = `
    SELECT	a.TargetID AS cd_pdv,
            a.TargetName AS ds_pdv,
            b.lat AS lat,
            b.lon AS lon,
            c.ESPECIALIDAD_IBC AS segmento,
            e.statuses AS twitter_statuses,
            f.usersCount AS foursquare_usercount,
            a.targetProvincia AS province,
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
    WHERE ${area} = @name_param`;

  new sql.Request()
    .input('name_param', sql.NVarChar, request.query.name.toUpperCase())
    .query(query)
    .then(recordset => {
      if (recordset.length) reply(recordset);
      else reply(Boom.notFound());
    })
    .catch(err => reply(err));
};
