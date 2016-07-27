'use strict';

const $ = require('jquery');

const { getToken, getVenues } = require('./utils/api.js');
const venueCard = require('./components/venue-card.js');
const pagination = require('./components/pagination.js');

// init foundation
$(document).foundation();

// init
$('.loading').toggle();
const api = getToken();
let currentIndex = 1;
let data = [];
let displayed = [];

api
.then(token => getVenues({ token, limit: 99 }))
.then((venues) => {
  data = venues;
  displayed = data;
  currentIndex = 1;
  $('.venues').html(displayed.slice(0, 99).map(venueCard).join('\n'));
  $('.pagination-container').html(pagination(data.length, currentIndex));
  $('.loading').toggle();
})
.catch(error => $('.loading').toggle());

// search
$('.filters').on('click', '.submit', (e) => {
  e.preventDefault();
  const query = $('.search').find('input[type="text"]').val().trim();

  $(e.currentTarget).prop('disabled', true);

  if (query) {
    $('.loading').toggle();
    api
    .then(token => getVenues({ query, token }))
    .then((venues) => {
      data = venues;
      displayed = data;
      currentIndex = 1;
      $('.venues').html(displayed.map(venueCard).join('\n'));
      $('.pagination-container').html(pagination(data.length, currentIndex));
      $(e.currentTarget).prop('disabled', false);
      $('.loading').toggle();
    })
    .catch(error => $('.loading').toggle());
  }
});

$('.search').on('input', 'input', (e) => {
  e.preventDefault();
  const val = $(e.currentTarget).val().trim().toLowerCase();
  displayed = data.filter(v => v.ds_pdv.toLowerCase().includes(val));
  currentIndex = 1;
  $('.venues').html(displayed.slice(0, 99).map(venueCard).join('\n'));
  $('.pagination-container').html(pagination(data.length, currentIndex));
});

// pagination
$('.pagination-container').on('click', 'a', (e) => {
  e.preventDefault();
  const page = $(e.currentTarget).text();
  if (page === 'Previous page') currentIndex -= 1;
  else if (page === 'Next page') currentIndex += 1;
  else currentIndex = parseInt(page, 10);
  $('.venues').html(displayed.slice(currentIndex * 99, currentIndex * 99 + 99).map(venueCard).join('\n'));
  $('.pagination-container').html(pagination(displayed.length, currentIndex));
  window.scrollTo(0, 0);
});
