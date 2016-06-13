'use strict';

const fs = require('fs');
const _ = require('lodash');
const fetch = require('node-fetch');

const run = require('../runner.js');
const model = require('./model.js');

// Set up config

const name = 'foursquare';
const tableName = 'ibc_seg.DM_SOURCE_FOURSQUARE_RAW';
const apiConfig = {
  api: process.env.FOURSQUARE_API,
  id: process.env.FOURSQUARE_ID,
  secret: process.env.FOURSQUARE_SECRET,
};

// Set up input data

const centroidesCodCensal = JSON.parse(fs.readFileSync('./input/centroides_cod_censal.json'));
const centroidesCodPostal = JSON.parse(fs.readFileSync('./input/centroides_cod_postal.json'));
const centroidesMunicipio = JSON.parse(fs.readFileSync('./input/centroides_municipio.json'));

const input = [...centroidesCodCensal, ...centroidesCodPostal, ...centroidesMunicipio]
  .map((item) => Object.assign(item, {
    name: `${item.latlon} | ${item.municipio} | ${item.type}`,
    cluster: `${item.latlon} | ${item.municipio} | ${item.type}`,
    section: 'food,drinks,coffee',
  }));

// Set up handlers

function handleGet({ latlon, section }) {
  const { api, id, secret } = apiConfig;
  const url = `${api}?ll=${latlon}&section=${section}&openNow=0&limit=50&offset=0&client_id=${id}&client_secret=${secret}&v=20160122`;
  return fetch(url)
    .then(res => res.json())
    .catch(error => ({ error, source: 'handleGet' }));
}

function handleResponse(item, response, done) {
  const { cluster, section } = item;

  if (response.meta.code === 200) {
    return response.response.groups[0].items
      .map(row => row.venue)
      .map((row, index) => _.merge({}, model, row, { cluster, section, index }))
      .filter(row => done.indexOf(row.id) === -1);
  }

  return { error: response.meta, source: 'handleResponse' };
}

// Run

run({
  config: { name, tableName },
  data: { input, model },
  handlers: { handleGet, handleResponse },
});
