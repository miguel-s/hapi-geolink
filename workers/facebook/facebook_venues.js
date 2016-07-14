'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const fetch = require('node-fetch');

const run = require('../runner.js');
const model = require('./model_venues.js');

// Set up config

const origin = 'facebook';
const list = 'venues';
const size = 1;
const apiConfig = {
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  api: 'https://graph.facebook.com/v2.6',
  fields: ['id', 'name', 'fan_count'],
  format: 'json',
};

// Set up input data

const foursquare = JSON.parse(fs.readFileSync(path.join(__dirname, './input/foursquare.json')));
const once = JSON.parse(fs.readFileSync(path.join(__dirname, './input/11870.json')));
const buscor = JSON.parse(fs.readFileSync(path.join(__dirname, './input/buscorestaurantes.json')));
const manpower = JSON.parse(fs.readFileSync(path.join(__dirname, './input/manpower.json')));
const manual = JSON.parse(fs.readFileSync(path.join(__dirname, './input/manual.json')));

const input = [...foursquare, ...once, ...buscor, ...manpower, ...manual]
  .map((item) => Object.assign({ original: item }, {
    name: item,
    cluster: item,
    section: null,
  }));

// Set up handlers

function handleGet({ original }) {
  const { api, fields, accessToken, format } = apiConfig;
  const url = `${api}/${original}?fields=${fields.join('%2C')}&access_token=${accessToken}&format=${format}`;
  return fetch(url)
    .then(res => res.json())
    .catch(error => ({ error, source: 'handleGet' }));
}

function handleResponse(item, response, done) {
  const { cluster, section } = item;
  const datetime = new Date().toISOString();
  let result = {};

  if (response.error) {
    result = {
      id: cluster,
      err_code: response.error.code,
      err_message: response.error.message,
    };
    if (response.error.code === 21) {
      result.migrated = response.error.message.match(/^\d+|\d+\b|\d+(?=\w)/g)[1];
    }
  } else {
    result = response;
  }

  // last opportunity to modify response object

  result = _.merge({}, model, result, { cluster, section, datetime });
  if (done.indexOf(result.id.toString()) === -1) return [result];
  return [];
}

// Run

run({
  config: { origin, list, size },
  data: { input, model },
  handlers: { handleGet, handleResponse },
});
