'use strict';

export default function venueCard(venue) {
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
};
