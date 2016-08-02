'use strict';

import { checkFetchStatus } from './utils.js';

function getToken() {
  return fetch('./api/v1/token', { credentials: 'same-origin' })
    .then(checkFetchStatus)
    .then(response => response.text());
}

function getVenues(options) {
  const keys = Object.keys(options);
  const params = keys.map(key => `${key}=${options[key]}`);

  return fetch(`./api/v1/venues?${params.join('&')}`)
    .then(checkFetchStatus)
    .then(response => response.json());
}

function getMap(token, area, name, gran) {
  return fetch(`./api/v1/map?area=${area}&name=${name}&gran=${gran}&token=${token}`)
    .then(checkFetchStatus)
    .then(response => response.json());
}

module.exports = {
  getToken,
  getVenues,
  getMap,
};
