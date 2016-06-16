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
      // FOURSQUARE
      var updateFoursquare = $('.foursquare .update');
      var stopFoursquare = $('.foursquare .stop');
      var progressFoursquare = $('.foursquare .progress');
      var downloadFoursquare = $('.foursquare .download');

      updateFoursquare.on('click', function (e) {
        e.preventDefault();
        socket.emit('foursquare_start');
      });
      stopFoursquare.on('click', function (e) {
        e.preventDefault();
        socket.emit('foursquare_stop');
      });

      socket.on('foursquare_start', function () {
        setButtonState([{ element: updateFoursquare, state: 'disabled' }, { element: stopFoursquare, state: '' }, { element: downloadFoursquare, state: 'disabled' }]);
      });
      socket.on('foursquare_stop', function () {
        setButtonState([{ element: updateFoursquare, state: '' }, { element: stopFoursquare, state: 'disabled' }, { element: downloadFoursquare, state: '' }]);
      });
      socket.on('foursquare_progress', function (data) {
        setProgressState(progressFoursquare, data);
      });

      // YELP
      var updateYelp = $('.yelp .update');
      var stopYelp = $('.yelp .stop');
      var progressYelp = $('.yelp .progress');
      var downloadYelp = $('.yelp .download');

      updateYelp.on('click', function (e) {
        e.preventDefault();
        socket.emit('yelp_start');
      });
      stopYelp.on('click', function (e) {
        e.preventDefault();
        socket.emit('yelp_stop');
      });

      socket.on('yelp_start', function () {
        setButtonState([{ element: updateYelp, state: 'disabled' }, { element: stopYelp, state: '' }, { element: downloadYelp, state: 'disabled' }]);
      });
      socket.on('yelp_stop', function () {
        setButtonState([{ element: updateYelp, state: '' }, { element: stopYelp, state: 'disabled' }, { element: downloadYelp, state: '' }]);
      });
      socket.on('yelp_progress', function (data) {
        setProgressState(progressYelp, data);
      });
    });
  });
})($, io);