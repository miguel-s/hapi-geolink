'use strict';

(function iife($) {
  // init foundation
  $(document).foundation();

  // helpers
  function checkFetchStatus(response) {
    if (response.status >= 200 && response.status < 300) return response;
    const error = new Error(response.statusText);
    error.response = response;
    throw new Error(error);
  }
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
  function htmlVenue(venue) {
    return `
      <div class="small-12 medium-6 large-4 columns">
        <div class="container">
          <div class="title">
            <div class="name">
              <h5>${venue.cd_pdv}</h5>
            </div>
            <div class="name">
              <h5>${venue.ds_pdv}</h5>
            </div>
          </div>
          <hr />
          <div class="stats-container">
            <div class="stats">
              <h5>${venue.twitter_statuses || '-'}</h5>
              <p>
                <span class="fa fa-twitter"></span>
              </p>
            </div>
            <div class="stats">
              <h5>${venue.foursquare_usercount || '-'}</h5>
              <p>
                <span class="fa fa-foursquare"></span>
              </p>
            </div>
          </div>
        </div>
      </div>`;
  }
  function htmlPagination(length, index) {
    const num = Math.ceil(length / 99);

    const previous = `
      <li class="pagination-previous ${index === 1 ? 'disabled' : ''}">
        ${index === 1
          ? 'Previous <span class="show-for-sr">page</span>'
          : '<a href="#" aria-label="Previous page">Previous <span class="show-for-sr">page</span></a>'}
      </li>`;
    const next = `
      <li class="pagination-next ${index === num ? 'disabled' : ''}">
        ${index === num
          ? 'Next <span class="show-for-sr">page</span>'
          : '<a href="#" aria-label="Next page">Next <span class="show-for-sr">page</span></a>'}
      </li>`;
    let pages = '';
    if (num <= 8) {
      for (let i = 1; i <= num; i++) {
        if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
        else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
      }
    } else {
      if (index < 4) {
        for (let i = 1; i < 4; i++) {
          if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
          else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
        }
        if (index === 3) pages += '<li><a href="#" aria-label="Page 4">4</a></li>';
        pages += '<li class="ellipsis" aria-hidden="true"></li>';
        pages += `<li><a href="#" aria-label="Page ${num}">${num}</a></li>`;
      } else if (index > num - 3) {
        pages += '<li><a href="#" aria-label="Page 1">1</a></li>';
        pages += '<li class="ellipsis" aria-hidden="true"></li>';
        if (index === num - 2) pages += `<li><a href="#" aria-label="Page ${num - 3}">${num - 3}</a></li>`;
        for (let i = num - 2; i <= num; i++) {
          if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
          else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
        }
      } else {
        pages += '<li><a href="#" aria-label="Page 1">1</a></li>';
        pages += '<li class="ellipsis" aria-hidden="true"></li>';
        for (let i = index - 1; i <= index + 1; i++) {
          if (i === index) pages += `<li class="current"><span class="show-for-sr">You're on page</span> ${i}</li>`;
          else pages += `<li><a href="#" aria-label="Page ${i}">${i}</a></li>`;
        }
        pages += '<li class="ellipsis" aria-hidden="true"></li>';
        pages += `<li><a href="#" aria-label="Page ${num}">${num}</a></li>`;
      }
    }

    return `
      <ul class="pagination text-center" role="navigation" aria-label="Pagination">
        ${previous}
        ${pages}
        ${next}
      </ul>`;
  }

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
    $('.venues').html(displayed.slice(0, 99).map(htmlVenue).join('\n'));
    $('.pagination-container').html(htmlPagination(data.length, currentIndex));
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
        $('.venues').html(displayed.map(htmlVenue).join('\n'));
        $('.pagination-container').html(htmlPagination(data.length, currentIndex));
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
    $('.venues').html(displayed.slice(0, 99).map(htmlVenue).join('\n'));
    $('.pagination-container').html(htmlPagination(data.length, currentIndex));
  });

  // pagination
  $('.pagination-container').on('click', 'a', (e) => {
    e.preventDefault();
    const page = $(e.currentTarget).text();
    if (page === 'Previous page') currentIndex -= 1;
    else if (page === 'Next page') currentIndex += 1;
    else currentIndex = parseInt(page, 10);
    $('.venues').html(displayed.slice(currentIndex * 99, currentIndex * 99 + 99).map(htmlVenue).join('\n'));
    $('.pagination-container').html(htmlPagination(displayed.length, currentIndex));
    window.scrollTo(0, 0);
  });
}($));
