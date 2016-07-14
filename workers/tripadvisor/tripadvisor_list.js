'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const xray = require('x-ray');

const run = require('../runner.js');
const model = require('./model_list.js');

// Set up config

const origin = 'tripadvisor';
const list = 'list';
const size = 30;

// Set up input data

const input = JSON.parse(fs.readFileSync(path.join(__dirname, './input/cities.json')))
  .map((item) => Object.assign(item, {
    name: item.name,
    cluster: item.id,
    section: null,
  }));

// Set up handlers

function handleGet({ url }) {
  const x = xray();

  return new Promise((resolve, reject) => {
    const scrape = x(url, '#EATERY_SEARCH_RESULTS div.listing',
      [{
        id: '@id',
        url: '.property_title@href',
        name: '.property_title',
        rank: '.popIndex',
        price: '.price_range',
        cuisine: ['.cuisine'],
      }]
    ).paginate('.nav.next@href');

    scrape((err, arr) => {
      if (err) reject(err);
      else resolve(arr);
    });
  })
  .catch(error => ({ error, source: 'handleGet' }));
}

function handleResponse(item, response, done) {
  const { cluster, section } = item;
  const datetime = new Date().toISOString();

  return response
    .map((row) => {
      // last opportunity to modify response objects
      const newRow = row;

      newRow.name = row.name.replace('\n', '').trim();
      newRow.rank = row.rank ? row.rank.replace('\n', '').trim() : null;
      newRow.city = item.label;
      newRow.cuisine = row.cuisine ? row.cuisine.join(', ') : null;

      return newRow;
    })
    .map((row, index) => _.merge({}, model, row, { cluster, section, index, datetime }))
    .filter(row => done.indexOf(row.id.toString()) === -1)
    .filter((row, index, array) => array.slice(0, index).map(row => row.id).indexOf(row.id) === -1);

  // return { error: response.meta, source: 'handleResponse' };
}

// Run

run({
  config: { origin, list, size },
  data: { input, model },
  handlers: { handleGet, handleResponse },
});
