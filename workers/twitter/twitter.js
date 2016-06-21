'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Twitter = require('twitter-node-client').Twitter;

const run = require('../runner.js');
const model = require('./model.js');

// modify behaviour of the doRequest method, only console.log when not child process
Twitter.prototype.doRequest = function doRequest(url, error, success) {
  // Fix the mismatch between OAuth's RFC3986's and
  // Javascript's beliefs in what is right and wrong ;)
  // From https://github.com/ttezel/twit/blob/master/lib/oarequest.js
  const fixedUrl = url.replace(/\!/g, '%21')
                      .replace(/\'/g, '%27')
                      .replace(/\(/g, '%28')
                      .replace(/\)/g, '%29')
                      .replace(/\*/g, '%2A');

  this.oauth.get(fixedUrl, this.accessToken, this.accessTokenSecret, (err, body, response) => {
    if (!process.send) console.log('URL [%s]', fixedUrl);
    if (!err && response.statusCode === 200) {
      success(body);
    } else {
      error(err, response, body);
    }
  });
};

// add a users api call to twitter-node-client
Twitter.prototype.getUsers = function getUsers(params, error, success) {
  const apiUrl = '/users/lookup.json';
  const paramsUrl = this.buildQS(params);
  const url = this.baseUrl + apiUrl + paramsUrl;
  this.doRequest(url, error, success);
};

// Set up config objects

const name = 'twitter';
const tableName = 'ibc_seg.DM_SOURCE_TWITTER_RAW';
const apiConfig = {
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  callBackUrl: process.env.TWITTER_CALLBACK_URL,
};

// Set up input data

const foursquare = JSON.parse(fs.readFileSync(path.join(__dirname, './input/foursquare.json')));
const once = JSON.parse(fs.readFileSync(path.join(__dirname, './input/11870.json')));
const buscor = JSON.parse(fs.readFileSync(path.join(__dirname, './input/buscorestaurantes.json')));
const manpower = JSON.parse(fs.readFileSync(path.join(__dirname, './input/manpower.json')));
const manual = JSON.parse(fs.readFileSync(path.join(__dirname, './input/manual.json')));

const total = [...foursquare, ...once, ...buscor, ...manpower, ...manual];
const chunks = [];
while (total.length) {
  chunks.push(total.splice(0, 99));
}
const input = chunks
  .map((chunk, index) => Object.assign({ chunk }, {
    name: `Chunk ${index}: `,
    cluster: chunk.join(','),
    section: null,
  }));

// Set up handlers

function handleGet({ cluster }) {
  const twitter = new Twitter(apiConfig);

  return new Promise((resolve, reject) => {
    twitter.getUsers(
      { screen_name: cluster },
      (err, response, body) => reject({ statusCode: err.statusCode, body }),
      (data) => resolve({ statusCode: 200, body: JSON.parse(data) })
    );
  })
  .catch(error => ({ error, source: 'handleGet' }));
}

function handleResponse(item, response, done) {
  const { cluster, section } = item;
  const datetime = new Date().toISOString();

  if (response.statusCode === 200) {
    return response.body
      .map((row) => {
        // last opportunity to modify response objects
        const newRow = row;
        newRow.status = {
          created_at: newRow.created_at,
          id: newRow.id,
          id_str: newRow.id_str,
          text: newRow.text,
          truncated: newRow.truncated,
          geo: newRow.geo,
          coordinates: newRow.coordinates,
          place: newRow.place,
          retweet_count: newRow.retweet_count,
          favorite_count: newRow.favorite_count,
          favorited: newRow.favorited,
          retweeted: newRow.retweeted,
        };
        delete newRow.entities;
        return newRow;
      })
      .map((row, index) => _.merge({}, model, row, { cluster, section, index, datetime }))
      .filter(row => done.indexOf(row.id.toString()) === -1);
  }

  return { error: response, source: 'handleResponse' };
}

// Run

run({
  config: { name, tableName },
  data: { input, model },
  handlers: { handleGet, handleResponse },
});
