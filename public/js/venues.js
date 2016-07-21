'use strict';

(function iife($) {
  // init foundation
  $(document).foundation();

  // helpers
  function checkFetchStatus(response) {
    if (response.status >= 200 && response.status < 300) return response;
    var error = new Error(response.statusText);
    error.response = response;
    throw new Error(error);
  }
  function getToken() {
    return fetch('./api/v1/token', { credentials: 'same-origin' }).then(checkFetchStatus).then(function (response) {
      return response.text();
    });
  }

  var api = getToken();

  $('.search').on('click', 'button', function (e) {
    e.preventDefault();
    var query = $('.search').find('input[type="text"]').val().trim();

    $(e.currentTarget).prop('disabled', true);

    if (query) {
      api.then(function (token) {
        fetch('./api/v1/venues?query=' + query + '&token=' + token).then(checkFetchStatus).then(function (response) {
          return response.json();
        }).then(function (venues) {
          var html = venues.map(function (venue) {
            return '\n            <div class="small-12 medium-6 large-4 columns">\n              <div class="container">\n                <div class="title">\n                  <div class="name">\n                    <h5>' + venue.cd_pdv + '</h5>\n                  </div>\n                  <div class="name">\n                    <h5>' + venue.ds_pdv + '</h5>\n                  </div>\n                </div>\n                <hr />\n                <div class="stats-container">\n                  <div class="stats">\n                    <h5>' + (venue.twitter_statuses || '-') + '</h5>\n                    <p>\n                      <span class="fa fa-twitter"></span>\n                    </p>\n                  </div>\n                  <div class="stats">\n                    <h5>' + (venue.foursquare_usercount || '-') + '</h5>\n                    <p>\n                      <span class="fa fa-foursquare"></span>\n                    </p>\n                  </div>\n                </div>\n              </div>\n            </div>';
          });

          $('.venues').html(html.join('\n'));
          $(e.currentTarget).prop('disabled', false);
        }).catch(function (error) {
          return console.log(error);
        });
      });
    }
  });
})($);