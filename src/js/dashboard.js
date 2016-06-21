'use strict';

(function iife($, io) {
  function setButtonState(buttons) {
    buttons.forEach(button => (
      button.state === 'disabled' ?
        button.element.addClass('disabled') :
        button.element.removeClass('disabled')
    ));
  }
  function setProgressState(element, state) {
    element.attr('aria-valuenow', state);
    element.attr('aria-valuetext', `${state} percent`);
    element.find('.progress-meter').width(`${state}%`);
    element.find('.progress-meter-text').text(`${state}%`);
  }

  fetch('./api/v1/token', { credentials: 'same-origin' })
  .then(response => response.text())
  .then((token) => {
    const socket = io({
      query: `token=${token}`,
    });
    socket.on('connect', () => {
      // FOURSQUARE
      const updateFoursquare = $('.foursquare .update');
      const stopFoursquare = $('.foursquare .stop');
      const progressFoursquare = $('.foursquare .progress');
      const downloadFoursquare = $('.foursquare .download');

      updateFoursquare.on('click', (e) => {
        e.preventDefault();
        socket.emit('foursquare_start');
      });
      stopFoursquare.on('click', (e) => {
        e.preventDefault();
        socket.emit('foursquare_stop');
      });

      socket.on('foursquare_start', () => {
        setButtonState([
          { element: updateFoursquare, state: 'disabled' },
          { element: stopFoursquare, state: '' },
          { element: downloadFoursquare, state: 'disabled' },
        ]);
      });
      socket.on('foursquare_stop', () => {
        setButtonState([
          { element: updateFoursquare, state: '' },
          { element: stopFoursquare, state: 'disabled' },
          { element: downloadFoursquare, state: '' },
        ]);
      });
      socket.on('foursquare_progress', (data) => {
        setProgressState(progressFoursquare, data);
      });

      // YELP
      const updateYelp = $('.yelp .update');
      const stopYelp = $('.yelp .stop');
      const progressYelp = $('.yelp .progress');
      const downloadYelp = $('.yelp .download');

      updateYelp.on('click', (e) => {
        e.preventDefault();
        socket.emit('yelp_start');
      });
      stopYelp.on('click', (e) => {
        e.preventDefault();
        socket.emit('yelp_stop');
      });

      socket.on('yelp_start', () => {
        setButtonState([
          { element: updateYelp, state: 'disabled' },
          { element: stopYelp, state: '' },
          { element: downloadYelp, state: 'disabled' },
        ]);
      });
      socket.on('yelp_stop', () => {
        setButtonState([
          { element: updateYelp, state: '' },
          { element: stopYelp, state: 'disabled' },
          { element: downloadYelp, state: '' },
        ]);
      });
      socket.on('yelp_progress', (data) => {
        setProgressState(progressYelp, data);
      });

      // TWITTER
      const updateTwitter = $('.twitter .update');
      const stopTwitter = $('.twitter .stop');
      const progressTwitter = $('.twitter .progress');
      const downloadTwitter = $('.twitter .download');

      updateTwitter.on('click', (e) => {
        e.preventDefault();
        socket.emit('twitter_start');
      });
      stopTwitter.on('click', (e) => {
        e.preventDefault();
        socket.emit('twitter_stop');
      });

      socket.on('twitter_start', () => {
        setButtonState([
          { element: updateTwitter, state: 'disabled' },
          { element: stopTwitter, state: '' },
          { element: downloadTwitter, state: 'disabled' },
        ]);
      });
      socket.on('twitter_stop', () => {
        setButtonState([
          { element: updateTwitter, state: '' },
          { element: stopTwitter, state: 'disabled' },
          { element: downloadTwitter, state: '' },
        ]);
      });
      socket.on('twitter_progress', (data) => {
        setProgressState(progressTwitter, data);
      });
    });
  });
}($, io));
