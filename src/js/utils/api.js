'use strict';

import { checkFetchStatus } from './utils.js';

export function getToken() {
  return fetch('./api/v1/token', { credentials: 'same-origin' })
    .then(checkFetchStatus)
    .then(response => response.text());
}

export function getVenues(options) {
  const keys = Object.keys(options);
  const params = keys.map(key => `${key}=${options[key]}`);

  return fetch(`./api/v1/venues?${params.join('&')}`)
    .then(checkFetchStatus)
    .then(response => response.json());
}

export function getMap(token, area, name, gran) {
  return fetch(`./api/v1/map?area=${area}&name=${name}&gran=${gran}&token=${token}`)
    .then(checkFetchStatus)
    .then(response => response.json());
}
