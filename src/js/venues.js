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

  const api = getToken();

  $('.search').on('click', 'button', (e) => {
    e.preventDefault();
    const query = $('.search').find('input[type="text"]').val().trim();

    $(e.currentTarget).prop('disabled', true);

    if (query) {
      api.then((token) => {
        fetch(`./api/v1/venues?query=${query}&token=${token}`)
        .then(checkFetchStatus)
        .then(response => response.json())
        .then((venues) => {
          const html = venues.map((venue) => (`
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
            </div>`)
          );

          $('.venues').html(html.join('\n'));
          $(e.currentTarget).prop('disabled', false);
        })
        .catch(error => console.log(error));
      });
    }
  });
}($));
