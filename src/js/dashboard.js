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
      // TWITTER
      const updateTwitter = $('.twitter .update');
      const stopTwitter = $('.twitter .stop');
      const progressTwitter = $('.twitter .progress');

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
        ]);
      });
      socket.on('twitter_stop', () => {
        setButtonState([
          { element: updateTwitter, state: '' },
          { element: stopTwitter, state: 'disabled' },
        ]);
      });
      socket.on('twitter_progress', (data) => {
        setProgressState(progressTwitter, data);
      });

      // FACEBOOK
      const updateFacebook = $('.facebook .update');
      const stopFacebook = $('.facebook .stop');
      const progressFacebook = $('.facebook .progress');

      updateFacebook.on('click', (e) => {
        e.preventDefault();
        socket.emit('facebook_start');
      });
      stopFacebook.on('click', (e) => {
        e.preventDefault();
        socket.emit('facebook_stop');
      });

      socket.on('facebook_start', () => {
        setButtonState([
          { element: updateFacebook, state: 'disabled' },
          { element: stopFacebook, state: '' },
        ]);
      });
      socket.on('facebook_stop', () => {
        setButtonState([
          { element: updateFacebook, state: '' },
          { element: stopFacebook, state: 'disabled' },
        ]);
      });
      socket.on('facebook_progress', (data) => {
        setProgressState(progressFacebook, data);
      });

      // FOURSQUARE
      const updateFoursquare = $('.foursquare .update');
      const stopFoursquare = $('.foursquare .stop');
      const progressFoursquare = $('.foursquare .progress');

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
        ]);
      });
      socket.on('foursquare_stop', () => {
        setButtonState([
          { element: updateFoursquare, state: '' },
          { element: stopFoursquare, state: 'disabled' },
        ]);
      });
      socket.on('foursquare_progress', (data) => {
        setProgressState(progressFoursquare, data);
      });

      // YELP
      const updateYelp = $('.yelp .update');
      const stopYelp = $('.yelp .stop');
      const progressYelp = $('.yelp .progress');

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
        ]);
      });
      socket.on('yelp_stop', () => {
        setButtonState([
          { element: updateYelp, state: '' },
          { element: stopYelp, state: 'disabled' },
        ]);
      });
      socket.on('yelp_progress', (data) => {
        setProgressState(progressYelp, data);
      });

      // TRIPADVISOR
      const updateTripadvisorList = $('.tripadvisor .list .update');
      const stopTripadvisorList = $('.tripadvisor .list .stop');
      const progressTripadvisorList = $('.tripadvisor .list .progress');

      updateTripadvisorList.on('click', (e) => {
        e.preventDefault();
        socket.emit('tripadvisor_list_start');
      });
      stopTripadvisorList.on('click', (e) => {
        e.preventDefault();
        socket.emit('tripadvisor_list_stop');
      });

      socket.on('tripadvisor_list_start', () => {
        setButtonState([
          { element: updateTripadvisorList, state: 'disabled' },
          { element: stopTripadvisorList, state: '' },
        ]);
      });
      socket.on('tripadvisor_list_stop', () => {
        setButtonState([
          { element: updateTripadvisorList, state: '' },
          { element: stopTripadvisorList, state: 'disabled' },
        ]);
      });
      socket.on('tripadvisor_list_progress', (data) => {
        setProgressState(progressTripadvisorList, data);
      });

      const updateTripadvisor = $('.tripadvisor .venues .update');
      const stopTripadvisor = $('.tripadvisor .venues .stop');
      const progressTripadvisor = $('.tripadvisor .venues .progress');

      updateTripadvisor.on('click', (e) => {
        e.preventDefault();
        socket.emit('tripadvisor_start');
      });
      stopTripadvisor.on('click', (e) => {
        e.preventDefault();
        socket.emit('tripadvisor_stop');
      });

      socket.on('tripadvisor_start', () => {
        setButtonState([
          { element: updateTripadvisor, state: 'disabled' },
          { element: stopTripadvisor, state: '' },
        ]);
      });
      socket.on('tripadvisor_stop', () => {
        setButtonState([
          { element: updateTripadvisor, state: '' },
          { element: stopTripadvisor, state: 'disabled' },
        ]);
      });
      socket.on('tripadvisor_progress', (data) => {
        setProgressState(progressTripadvisor, data);
      });

      // MICHELIN
      const updateMichelinList = $('.michelin .list .update');
      const stopMichelinList = $('.michelin .list .stop');
      const progressMichelinList = $('.michelin .list .progress');

      updateMichelinList.on('click', (e) => {
        e.preventDefault();
        socket.emit('michelin_list_start');
      });
      stopMichelinList.on('click', (e) => {
        e.preventDefault();
        socket.emit('michelin_list_stop');
      });

      socket.on('michelin_list_start', () => {
        setButtonState([
          { element: updateMichelinList, state: 'disabled' },
          { element: stopMichelinList, state: '' },
        ]);
      });
      socket.on('michelin_list_stop', () => {
        setButtonState([
          { element: updateMichelinList, state: '' },
          { element: stopMichelinList, state: 'disabled' },
        ]);
      });
      socket.on('michelin_list_progress', (data) => {
        setProgressState(progressMichelinList, data);
      });

      const updateMichelin = $('.michelin .venues .update');
      const stopMichelin = $('.michelin .venues .stop');
      const progressMichelin = $('.michelin .venues .progress');

      updateMichelin.on('click', (e) => {
        e.preventDefault();
        socket.emit('michelin_start');
      });
      stopMichelin.on('click', (e) => {
        e.preventDefault();
        socket.emit('michelin_stop');
      });

      socket.on('michelin_start', () => {
        setButtonState([
          { element: updateMichelin, state: 'disabled' },
          { element: stopMichelin, state: '' },
        ]);
      });
      socket.on('michelin_stop', () => {
        setButtonState([
          { element: updateMichelin, state: '' },
          { element: stopMichelin, state: 'disabled' },
        ]);
      });
      socket.on('michelin_progress', (data) => {
        setProgressState(progressMichelin, data);
      });

      // MICHELIN
      const updateRepsolListPages = $('.repsol .list-pages .update');
      const stopRepsolListPages = $('.repsol .list-pages .stop');
      const progressRepsolListPages = $('.repsol .list-pages .progress');

      updateRepsolListPages.on('click', (e) => {
        e.preventDefault();
        socket.emit('repsol_list_pages_start');
      });
      stopRepsolListPages.on('click', (e) => {
        e.preventDefault();
        socket.emit('repsol_list_pages_stop');
      });

      socket.on('repsol_list_pages_start', () => {
        setButtonState([
          { element: updateRepsolListPages, state: 'disabled' },
          { element: stopRepsolListPages, state: '' },
        ]);
      });
      socket.on('repsol_list_pages_stop', () => {
        setButtonState([
          { element: updateRepsolListPages, state: '' },
          { element: stopRepsolListPages, state: 'disabled' },
        ]);
      });
      socket.on('repsol_list_pages_progress', (data) => {
        setProgressState(progressRepsolListPages, data);
      });

      const updateRepsolListRestaurants = $('.repsol .list-restaurants .update');
      const stopRepsolListRestaurants = $('.repsol .list-restaurants .stop');
      const progressRepsolListRestaurants = $('.repsol .list-restaurants .progress');

      updateRepsolListRestaurants.on('click', (e) => {
        e.preventDefault();
        socket.emit('repsol_list_restaurants_start');
      });
      stopRepsolListRestaurants.on('click', (e) => {
        e.preventDefault();
        socket.emit('repsol_list_restaurants_stop');
      });

      socket.on('repsol_list_restaurants_start', () => {
        setButtonState([
          { element: updateRepsolListRestaurants, state: 'disabled' },
          { element: stopRepsolListRestaurants, state: '' },
        ]);
      });
      socket.on('repsol_list_restaurants_stop', () => {
        setButtonState([
          { element: updateRepsolListRestaurants, state: '' },
          { element: stopRepsolListRestaurants, state: 'disabled' },
        ]);
      });
      socket.on('repsol_list_restaurants_progress', (data) => {
        setProgressState(progressRepsolListRestaurants, data);
      });

      const updateRepsol = $('.repsol .venues .update');
      const stopRepsol = $('.repsol .venues .stop');
      const progressRepsol = $('.repsol .venues .progress');

      updateRepsol.on('click', (e) => {
        e.preventDefault();
        socket.emit('repsol_start');
      });
      stopRepsol.on('click', (e) => {
        e.preventDefault();
        socket.emit('repsol_stop');
      });

      socket.on('repsol_start', () => {
        setButtonState([
          { element: updateRepsol, state: 'disabled' },
          { element: stopRepsol, state: '' },
        ]);
      });
      socket.on('repsol_stop', () => {
        setButtonState([
          { element: updateRepsol, state: '' },
          { element: stopRepsol, state: 'disabled' },
        ]);
      });
      socket.on('repsol_progress', (data) => {
        setProgressState(progressRepsol, data);
      });
    });
  });
}($, io));
