'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const xray = require('x-ray');

const run = require('../runner.js');
const model = require('./model_pages.js');

// Set up config

const origin = 'tripadvisor';
const list = 'pages';
const size = 1;

// Set up input data

const input = JSON.parse(fs.readFileSync(path.join(__dirname, './input/cities.json')))
  .map((item) => Object.assign({}, item, {
    name: item.name,
    cluster: item.id,
    section: null,
  }));

// Set up handlers

function handleGet({ id, url }) {
  const x = xray();

  return new Promise((resolve, reject) => {
    const scrape = x(url, '.pageNumbers', ['a']);

    scrape((err, arr) => {
      if (err) reject(err);
      else {
        const urls = [];
        const pages = parseInt(arr[arr.length - 1], 10);
        for (let i = 0; i < pages; i++) {
          urls.push(`https://www.tripadvisor.es/RestaurantSearch?geo=${id}&o=a${i * 30}&itags=10591&sortOrder=popularity`);
        }
        resolve(urls);
      }
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
      const newRow = { url: row };

      newRow.id = row.replace('https://www.tripadvisor.es/RestaurantSearch?', '');

      return newRow;
    })
    .map((row, index) => _.merge({}, model, row, { cluster, section, index, datetime }))
    .filter(row => done.indexOf(row.id.toString()) === -1);

  // return { error: response.meta, source: 'handleResponse' };
}

// Run

run({
  config: { origin, list, size },
  data: { input, model },
  handlers: { handleGet, handleResponse },
});
