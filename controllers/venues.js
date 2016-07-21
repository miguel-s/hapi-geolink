'use strict';

const fetch = require('node-fetch');
const Boom = require('boom');

module.exports = function handler(request, reply) {
  const url = `http://localhost:${process.env.PORT_GEOLINK}/api/v1/venues?limit=100&token=${process.env.GEOLINK_TOKEN}`;

  fetch(url)
  .then(res => res.json())
  .then(response => {
    if (!response.statusCode) return reply.view('venues', { venues: response });
    throw new Error(response);
  })
  .catch(error => reply(Boom.badImplementation()));
};
