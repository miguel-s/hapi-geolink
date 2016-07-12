'use strict';

(function iife($, io) {
  // init foundation
  $(document).foundation();

  $('input[type="radio"] + label').on('click', function (e) {
    var input = $(e.currentTarget).siblings('input[type="radio"]');
    var origin = input.attr('name');
    var list = input.val();
    $('.' + origin + ' .controls button').data('list', list);
  });

  fetch('./api/v1/token', { credentials: 'same-origin' }).then(function (response) {
    return response.text();
  }).then(function (token) {
    var socket = io({ query: 'token=' + token });

    socket.on('connect', function () {
      $('.update').on('click', function (e) {
        e.preventDefault();
        var origin = $(e.currentTarget).data('origin');
        var list = $(e.currentTarget).data('list');
        socket.emit('start', { origin: origin, list: list });
      });
      $('.stop').on('click', function (e) {
        e.preventDefault();
        var origin = $(e.currentTarget).data('origin');
        var list = $(e.currentTarget).data('list');
        socket.emit('stop', { origin: origin, list: list });
      });

      socket.on('start', function (payload) {
        var origin = payload.origin;

        var element = $('.' + origin);
        element.find('.update').hide();
        element.find('.stop').show();
        element.find('.progress').show();
        element.find('input[type="radio"]').prop('disabled', true);
      });
      socket.on('stop', function (payload) {
        var origin = payload.origin;

        var element = $('.' + origin);
        element.find('.update').show();
        element.find('.stop').hide();
        element.find('.progress').hide();
        element.find('input[type="radio"]').prop('disabled', false);
      });
      socket.on('progress', function (payload) {
        var origin = payload.origin;
        var progress = payload.progress;

        var element = $('.' + origin + ' .progress');
        element.attr('aria-valuenow', progress);
        element.attr('aria-valuetext', progress + ' percent');
        element.find('.progress-meter').width(progress + '%');
        element.find('.progress-meter-text').text(progress + '%');
      });
    });
  });
})($, io);