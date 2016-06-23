'use strict';

(function iife($, io) {
  function setButtonState(buttons) {
    buttons.forEach(function (button) {
      return button.state === 'disabled' ? button.element.addClass('disabled') : button.element.removeClass('disabled');
    });
  }
  function setProgressState(element, state) {
    element.attr('aria-valuenow', state);
    element.attr('aria-valuetext', state + ' percent');
    element.find('.progress-meter').width(state + '%');
    element.find('.progress-meter-text').text(state + '%');
  }

  fetch('./api/v1/token', { credentials: 'same-origin' }).then(function (response) {
    return response.text();
  }).then(function (token) {
    var socket = io({
      query: 'token=' + token
    });
    socket.on('connect', function () {
      // TWITTER
      var updateTwitter = $('.twitter .update');
      var stopTwitter = $('.twitter .stop');
      var progressTwitter = $('.twitter .progress');

      updateTwitter.on('click', function (e) {
        e.preventDefault();
        socket.emit('twitter_start');
      });
      stopTwitter.on('click', function (e) {
        e.preventDefault();
        socket.emit('twitter_stop');
      });

      socket.on('twitter_start', function () {
        setButtonState([{ element: updateTwitter, state: 'disabled' }, { element: stopTwitter, state: '' }]);
      });
      socket.on('twitter_stop', function () {
        setButtonState([{ element: updateTwitter, state: '' }, { element: stopTwitter, state: 'disabled' }]);
      });
      socket.on('twitter_progress', function (data) {
        setProgressState(progressTwitter, data);
      });

      // FACEBOOK
      var updateFacebook = $('.facebook .update');
      var stopFacebook = $('.facebook .stop');
      var progressFacebook = $('.facebook .progress');

      updateFacebook.on('click', function (e) {
        e.preventDefault();
        socket.emit('facebook_start');
      });
      stopFacebook.on('click', function (e) {
        e.preventDefault();
        socket.emit('facebook_stop');
      });

      socket.on('facebook_start', function () {
        setButtonState([{ element: updateFacebook, state: 'disabled' }, { element: stopFacebook, state: '' }]);
      });
      socket.on('facebook_stop', function () {
        setButtonState([{ element: updateFacebook, state: '' }, { element: stopFacebook, state: 'disabled' }]);
      });
      socket.on('facebook_progress', function (data) {
        setProgressState(progressFacebook, data);
      });

      // FOURSQUARE
      var updateFoursquare = $('.foursquare .update');
      var stopFoursquare = $('.foursquare .stop');
      var progressFoursquare = $('.foursquare .progress');

      updateFoursquare.on('click', function (e) {
        e.preventDefault();
        socket.emit('foursquare_start');
      });
      stopFoursquare.on('click', function (e) {
        e.preventDefault();
        socket.emit('foursquare_stop');
      });

      socket.on('foursquare_start', function () {
        setButtonState([{ element: updateFoursquare, state: 'disabled' }, { element: stopFoursquare, state: '' }]);
      });
      socket.on('foursquare_stop', function () {
        setButtonState([{ element: updateFoursquare, state: '' }, { element: stopFoursquare, state: 'disabled' }]);
      });
      socket.on('foursquare_progress', function (data) {
        setProgressState(progressFoursquare, data);
      });

      // YELP
      var updateYelp = $('.yelp .update');
      var stopYelp = $('.yelp .stop');
      var progressYelp = $('.yelp .progress');

      updateYelp.on('click', function (e) {
        e.preventDefault();
        socket.emit('yelp_start');
      });
      stopYelp.on('click', function (e) {
        e.preventDefault();
        socket.emit('yelp_stop');
      });

      socket.on('yelp_start', function () {
        setButtonState([{ element: updateYelp, state: 'disabled' }, { element: stopYelp, state: '' }]);
      });
      socket.on('yelp_stop', function () {
        setButtonState([{ element: updateYelp, state: '' }, { element: stopYelp, state: 'disabled' }]);
      });
      socket.on('yelp_progress', function (data) {
        setProgressState(progressYelp, data);
      });

      // TRIPADVISOR
      var updateTripadvisorList = $('.tripadvisor .list .update');
      var stopTripadvisorList = $('.tripadvisor .list .stop');
      var progressTripadvisorList = $('.tripadvisor .list .progress');

      updateTripadvisorList.on('click', function (e) {
        e.preventDefault();
        socket.emit('tripadvisor_list_start');
      });
      stopTripadvisorList.on('click', function (e) {
        e.preventDefault();
        socket.emit('tripadvisor_list_stop');
      });

      socket.on('tripadvisor_list_start', function () {
        setButtonState([{ element: updateTripadvisorList, state: 'disabled' }, { element: stopTripadvisorList, state: '' }]);
      });
      socket.on('tripadvisor_list_stop', function () {
        setButtonState([{ element: updateTripadvisorList, state: '' }, { element: stopTripadvisorList, state: 'disabled' }]);
      });
      socket.on('tripadvisor_list_progress', function (data) {
        setProgressState(progressTripadvisorList, data);
      });

      var updateTripadvisor = $('.tripadvisor .venues .update');
      var stopTripadvisor = $('.tripadvisor .venues .stop');
      var progressTripadvisor = $('.tripadvisor .venues .progress');

      updateTripadvisor.on('click', function (e) {
        e.preventDefault();
        socket.emit('tripadvisor_start');
      });
      stopTripadvisor.on('click', function (e) {
        e.preventDefault();
        socket.emit('tripadvisor_stop');
      });

      socket.on('tripadvisor_start', function () {
        setButtonState([{ element: updateTripadvisor, state: 'disabled' }, { element: stopTripadvisor, state: '' }]);
      });
      socket.on('tripadvisor_stop', function () {
        setButtonState([{ element: updateTripadvisor, state: '' }, { element: stopTripadvisor, state: 'disabled' }]);
      });
      socket.on('tripadvisor_progress', function (data) {
        setProgressState(progressTripadvisor, data);
      });

      // MICHELIN
      var updateMichelinList = $('.michelin .list .update');
      var stopMichelinList = $('.michelin .list .stop');
      var progressMichelinList = $('.michelin .list .progress');

      updateMichelinList.on('click', function (e) {
        e.preventDefault();
        socket.emit('michelin_list_start');
      });
      stopMichelinList.on('click', function (e) {
        e.preventDefault();
        socket.emit('michelin_list_stop');
      });

      socket.on('michelin_list_start', function () {
        setButtonState([{ element: updateMichelinList, state: 'disabled' }, { element: stopMichelinList, state: '' }]);
      });
      socket.on('michelin_list_stop', function () {
        setButtonState([{ element: updateMichelinList, state: '' }, { element: stopMichelinList, state: 'disabled' }]);
      });
      socket.on('michelin_list_progress', function (data) {
        setProgressState(progressMichelinList, data);
      });

      var updateMichelin = $('.michelin .venues .update');
      var stopMichelin = $('.michelin .venues .stop');
      var progressMichelin = $('.michelin .venues .progress');

      updateMichelin.on('click', function (e) {
        e.preventDefault();
        socket.emit('michelin_start');
      });
      stopMichelin.on('click', function (e) {
        e.preventDefault();
        socket.emit('michelin_stop');
      });

      socket.on('michelin_start', function () {
        setButtonState([{ element: updateMichelin, state: 'disabled' }, { element: stopMichelin, state: '' }]);
      });
      socket.on('michelin_stop', function () {
        setButtonState([{ element: updateMichelin, state: '' }, { element: stopMichelin, state: 'disabled' }]);
      });
      socket.on('michelin_progress', function (data) {
        setProgressState(progressMichelin, data);
      });

      // MICHELIN
      var updateRepsolListPages = $('.repsol .list-pages .update');
      var stopRepsolListPages = $('.repsol .list-pages .stop');
      var progressRepsolListPages = $('.repsol .list-pages .progress');

      updateRepsolListPages.on('click', function (e) {
        e.preventDefault();
        socket.emit('repsol_list_pages_start');
      });
      stopRepsolListPages.on('click', function (e) {
        e.preventDefault();
        socket.emit('repsol_list_pages_stop');
      });

      socket.on('repsol_list_pages_start', function () {
        setButtonState([{ element: updateRepsolListPages, state: 'disabled' }, { element: stopRepsolListPages, state: '' }]);
      });
      socket.on('repsol_list_pages_stop', function () {
        setButtonState([{ element: updateRepsolListPages, state: '' }, { element: stopRepsolListPages, state: 'disabled' }]);
      });
      socket.on('repsol_list_pages_progress', function (data) {
        setProgressState(progressRepsolListPages, data);
      });

      var updateRepsolListRestaurants = $('.repsol .list-restaurants .update');
      var stopRepsolListRestaurants = $('.repsol .list-restaurants .stop');
      var progressRepsolListRestaurants = $('.repsol .list-restaurants .progress');

      updateRepsolListRestaurants.on('click', function (e) {
        e.preventDefault();
        socket.emit('repsol_list_restaurants_start');
      });
      stopRepsolListRestaurants.on('click', function (e) {
        e.preventDefault();
        socket.emit('repsol_list_restaurants_stop');
      });

      socket.on('repsol_list_restaurants_start', function () {
        setButtonState([{ element: updateRepsolListRestaurants, state: 'disabled' }, { element: stopRepsolListRestaurants, state: '' }]);
      });
      socket.on('repsol_list_restaurants_stop', function () {
        setButtonState([{ element: updateRepsolListRestaurants, state: '' }, { element: stopRepsolListRestaurants, state: 'disabled' }]);
      });
      socket.on('repsol_list_restaurants_progress', function (data) {
        setProgressState(progressRepsolListRestaurants, data);
      });

      var updateRepsol = $('.repsol .venues .update');
      var stopRepsol = $('.repsol .venues .stop');
      var progressRepsol = $('.repsol .venues .progress');

      updateRepsol.on('click', function (e) {
        e.preventDefault();
        socket.emit('repsol_start');
      });
      stopRepsol.on('click', function (e) {
        e.preventDefault();
        socket.emit('repsol_stop');
      });

      socket.on('repsol_start', function () {
        setButtonState([{ element: updateRepsol, state: 'disabled' }, { element: stopRepsol, state: '' }]);
      });
      socket.on('repsol_stop', function () {
        setButtonState([{ element: updateRepsol, state: '' }, { element: stopRepsol, state: 'disabled' }]);
      });
      socket.on('repsol_progress', function (data) {
        setProgressState(progressRepsol, data);
      });
    });
  });
})($, io);