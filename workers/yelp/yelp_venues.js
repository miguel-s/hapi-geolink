'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Yelp = require('yelp');

const run = require('../runner.js');
const model = require('./model_venues.js');

// Set up config objects

const origin = 'yelp';
const list = 'venues';
const size = 1;
const apiConfig = {
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET,
};

// Set up input data

const input = JSON.parse(fs.readFileSync(path.join(__dirname, './input/centroides.json')))
  .map((item) => Object.assign({ latlon: item }, {
    name: item,
    cluster: item,
    section: 'restaurants,nightlife',
  }));

// Set up handlers

function handleGet({ latlon, section }) {
  const yelp = new Yelp(apiConfig);

  return yelp.search({
    offset: 0,
    limit: 20,
    ll: latlon,
    category_filter: section,
    radius_filter: 150,
    sort: 1,
  })
  .catch(error => ({ error, source: 'handleGet' }));
}

function handleResponse(item, response, done) {
  const { cluster, section } = item;
  const datetime = new Date().toISOString();

  if (!response.statusCode) {
    const rows = response.businesses
      .filter(row => done.indexOf(row.id.toString()) === -1);

    if (rows.length) {
      return rows
        .map((row) => {
          // last opportunity to modify response objects
          const newRow = row;
          return newRow;
        })
        .map((row, index) => _.merge({}, model, row, { cluster, section, index, datetime }));
    }

    const id = `empty_centroid (${cluster})`;
    return [_.merge({}, model, { id, cluster, section, index: null, datetime })];
  }

  return { error: response.meta, source: 'handleResponse' };
}

// Run

run({
  config: { origin, list, size },
  data: { input, model },
  handlers: { handleGet, handleResponse },
});
