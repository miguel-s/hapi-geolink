(function iife($, io) {
  fetch('./api/v1/token', { credentials: 'same-origin' })
  .then(response => response.text())
  .then((token) => {
    const socket = io({
      query: `token=${token}`,
    });
    socket.on('connect', () => {
      // FOURSQUARE
      const updateFoursquare = $('.foursquare .update');
      const pauseFoursquare = $('.foursquare .pause');
      const progressFoursquare = $('.foursquare .progress');
      const downloadFoursquare = $('.foursquare .download');

      socket.on('foursquare_start', () => {
        updateFoursquare.toggleClass('disabled');
        pauseFoursquare.toggleClass('disabled');
        downloadFoursquare.toggleClass('disabled');

        progressFoursquare.attr('aria-valuenow', 0);
        progressFoursquare.attr('aria-valuetext', '0 percent');
        progressFoursquare.find('.progress-meter').width('0%');
        progressFoursquare.find('.progress-meter-text').text('0%');
      });
      socket.on('foursquare_done', () => {
        updateFoursquare.toggleClass('disabled');
        pauseFoursquare.toggleClass('disabled');
        downloadFoursquare.toggleClass('disabled');

        progressFoursquare.attr('aria-valuenow', 0);
        progressFoursquare.attr('aria-valuetext', '0 percent');
        progressFoursquare.find('.progress-meter').width('0%');
        progressFoursquare.find('.progress-meter-text').text('0%');
      });
      socket.on('foursquare_pause', () => {
        updateFoursquare.toggleClass('disabled');
        pauseFoursquare.toggleClass('disabled');
        downloadFoursquare.toggleClass('disabled');
      });
      socket.on('foursquare_progress', (data) => {
        progressFoursquare.attr('aria-valuenow', data);
        progressFoursquare.attr('aria-valuetext', `${data} percent`);
        progressFoursquare.find('.progress-meter').width(`${data}%`);
        progressFoursquare.find('.progress-meter-text').text(`${data}%`);
      });

      updateFoursquare.on('click', (e) => {
        e.preventDefault();
        socket.emit('foursquare_start');
      });
      pauseFoursquare.on('click', (e) => {
        e.preventDefault();
        socket.emit('foursquare_pause');
      });

      // YELP
      const updateYelp = $('.yelp .update');
      const pauseYelp = $('.yelp .pause');
      const progressYelp = $('.yelp .progress');
      const downloadYelp = $('.yelp .download');

      socket.on('yelp_start', () => {
        updateYelp.toggleClass('disabled');
        pauseYelp.toggleClass('disabled');
        downloadYelp.toggleClass('disabled');

        progressYelp.attr('aria-valuenow', 0);
        progressYelp.attr('aria-valuetext', '0 percent');
        progressYelp.find('.progress-meter').width('0%');
        progressYelp.find('.progress-meter-text').text('0%');
      });
      socket.on('yelp_done', () => {
        updateYelp.toggleClass('disabled');
        pauseYelp.toggleClass('disabled');
        downloadYelp.toggleClass('disabled');

        progressYelp.attr('aria-valuenow', 0);
        progressYelp.attr('aria-valuetext', '0 percent');
        progressYelp.find('.progress-meter').width('0%');
        progressYelp.find('.progress-meter-text').text('0%');
      });
      socket.on('yelp_pause', () => {
        updateYelp.toggleClass('disabled');
        pauseYelp.toggleClass('disabled');
        downloadYelp.toggleClass('disabled');
      });
      socket.on('yelp_progress', (data) => {
        progressYelp.attr('aria-valuenow', data);
        progressYelp.attr('aria-valuetext', `${data} percent`);
        progressYelp.find('.progress-meter').width(`${data}%`);
        progressYelp.find('.progress-meter-text').text(`${data}%`);
      });

      updateYelp.on('click', (e) => {
        e.preventDefault();
        socket.emit('yelp_start');
      });
      pauseYelp.on('click', (e) => {
        e.preventDefault();
        socket.emit('yelp_pause');
      });
    });
  });
}($, io));
