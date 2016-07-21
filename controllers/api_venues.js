'use strict';

const Boom = require('boom');

module.exports = function handler(request, reply) {
  const sql = request.server.app.minsaitdb;

  const limit = request.query.limit ? `TOP ${request.query.limit}` : '';
  const name = request.query.name ? request.query.name.toUpperCase() : '';
  const query = request.query.query ? `%${request.query.query.toUpperCase()}%` : '';

  let area = '';
  if (request.query.area === 'ccaa') area = '';
  else if (request.query.area === 'province') area = 'a.targetProvincia';
  else if (request.query.area === 'city') area = 'a.targetMunicipio';
  else area = '';

  const conditions = [];
  if (area) conditions.push(`${area} = @name_param`);
  if (query) conditions.push('a.TargetName LIKE @query_param');

  const select = `
    SELECT ${limit}
      a.TargetID AS cd_pdv,
      a.TargetName AS ds_pdv,
      b.lat AS lat,
      b.lon AS lon,
      c.ESPECIALIDAD_IBC AS segmento,
      e.statuses AS twitter_statuses,
      f.usersCount AS foursquare_usercount,
      a.targetProvincia AS province,
      a.targetMunicipio AS city`;

  const body = `
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
    ON d.id4Square = f.id`;

  let where = '';
  if (conditions.length) {
    conditions.forEach((condition, index) => {
      if (index === 0) where += ' WHERE ';
      else where += ' AND ';
      where += condition;
    });
  }

  const statement = `
    ${select}
    ${body}
    ${where}`;

  new sql.Request()
    .input('name_param', sql.NVarChar, name)
    .input('query_param', sql.NVarChar, query)
    .query(statement)
    .then(recordset => {
      if (recordset.length) reply(recordset);
      else reply(Boom.notFound());
    })
    .catch(err => reply(err));
};
