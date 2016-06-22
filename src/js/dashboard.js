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
    });
  });
}($, io));
