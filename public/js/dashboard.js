'use strict';

(function iife($, io) {
  fetch('./api/v1/token', { credentials: 'same-origin' }).then(function (response) {
    return response.text();
  }).then(function (token) {
    var socket = io({
      query: 'token=' + token
    });
    socket.on('connect', function () {
      // FOURSQUARE
      var updateFoursquare = $('.foursquare .update');
      var pauseFoursquare = $('.foursquare .pause');
      var progressFoursquare = $('.foursquare .progress');
      var downloadFoursquare = $('.foursquare .download');

      socket.on('foursquare_start', function () {
        updateFoursquare.toggleClass('disabled');
        pauseFoursquare.toggleClass('disabled');
        downloadFoursquare.toggleClass('disabled');

        progressFoursquare.attr('aria-valuenow', 0);
        progressFoursquare.attr('aria-valuetext', '0 percent');
        progressFoursquare.find('.progress-meter').width('0%');
        progressFoursquare.find('.progress-meter-text').text('0%');
      });
      socket.on('foursquare_done', function () {
        updateFoursquare.toggleClass('disabled');
        pauseFoursquare.toggleClass('disabled');
        downloadFoursquare.toggleClass('disabled');

        progressFoursquare.attr('aria-valuenow', 0);
        progressFoursquare.attr('aria-valuetext', '0 percent');
        progressFoursquare.find('.progress-meter').width('0%');
        progressFoursquare.find('.progress-meter-text').text('0%');
      });
      socket.on('foursquare_pause', function () {
        updateFoursquare.toggleClass('disabled');
        pauseFoursquare.toggleClass('disabled');
        downloadFoursquare.toggleClass('disabled');
      });
      socket.on('foursquare_progress', function (data) {
        progressFoursquare.attr('aria-valuenow', data);
        progressFoursquare.attr('aria-valuetext', data + ' percent');
        progressFoursquare.find('.progress-meter').width(data + '%');
        progressFoursquare.find('.progress-meter-text').text(data + '%');
      });

      updateFoursquare.on('click', function (e) {
        e.preventDefault();
        socket.emit('foursquare_start');
      });
      pauseFoursquare.on('click', function (e) {
        e.preventDefault();
        socket.emit('foursquare_pause');
      });

      // YELP
      var updateYelp = $('.yelp .update');
      var pauseYelp = $('.yelp .pause');
      var progressYelp = $('.yelp .progress');
      var downloadYelp = $('.yelp .download');

      socket.on('yelp_start', function () {
        updateYelp.toggleClass('disabled');
        pauseYelp.toggleClass('disabled');
        downloadYelp.toggleClass('disabled');

        progressYelp.attr('aria-valuenow', 0);
        progressYelp.attr('aria-valuetext', '0 percent');
        progressYelp.find('.progress-meter').width('0%');
        progressYelp.find('.progress-meter-text').text('0%');
      });
      socket.on('yelp_done', function () {
        updateYelp.toggleClass('disabled');
        pauseYelp.toggleClass('disabled');
        downloadYelp.toggleClass('disabled');

        progressYelp.attr('aria-valuenow', 0);
        progressYelp.attr('aria-valuetext', '0 percent');
        progressYelp.find('.progress-meter').width('0%');
        progressYelp.find('.progress-meter-text').text('0%');
      });
      socket.on('yelp_pause', function () {
        updateYelp.toggleClass('disabled');
        pauseYelp.toggleClass('disabled');
        downloadYelp.toggleClass('disabled');
      });
      socket.on('yelp_progress', function (data) {
        progressYelp.attr('aria-valuenow', data);
        progressYelp.attr('aria-valuetext', data + ' percent');
        progressYelp.find('.progress-meter').width(data + '%');
        progressYelp.find('.progress-meter-text').text(data + '%');
      });

      updateYelp.on('click', function (e) {
        e.preventDefault();
        socket.emit('yelp_start');
      });
      pauseYelp.on('click', function (e) {
        e.preventDefault();
        socket.emit('yelp_pause');
      });
    });
  });
})($, io);