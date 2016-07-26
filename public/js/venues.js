/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	(function iife($) {
	  // init foundation
	  $(document).foundation();

	  // helpers
	  function checkFetchStatus(response) {
	    if (response.status >= 200 && response.status < 300) return response;
	    var error = new Error(response.statusText);
	    error.response = response;
	    throw new Error(error);
	  }
	  function getToken() {
	    return fetch('./api/v1/token', { credentials: 'same-origin' }).then(checkFetchStatus).then(function (response) {
	      return response.text();
	    });
	  }
	  function getVenues(options) {
	    var keys = Object.keys(options);
	    var params = keys.map(function (key) {
	      return key + '=' + options[key];
	    });

	    return fetch('./api/v1/venues?' + params.join('&')).then(checkFetchStatus).then(function (response) {
	      return response.json();
	    });
	  }
	  function htmlVenue(venue) {
	    return '\n      <div class="small-12 medium-6 large-4 columns">\n        <div class="container">\n          <div class="title">\n            <div class="name">\n              <h5>' + venue.cd_pdv + '</h5>\n            </div>\n            <div class="name">\n              <h5>' + venue.ds_pdv + '</h5>\n            </div>\n          </div>\n          <hr />\n          <div class="stats-container">\n            <div class="stats">\n              <h5>' + (venue.twitter_statuses || '-') + '</h5>\n              <p>\n                <span class="fa fa-twitter"></span>\n              </p>\n            </div>\n            <div class="stats">\n              <h5>' + (venue.foursquare_usercount || '-') + '</h5>\n              <p>\n                <span class="fa fa-foursquare"></span>\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>';
	  }
	  function htmlPagination(length, index) {
	    var num = Math.ceil(length / 99);

	    var previous = '\n      <li class="pagination-previous ' + (index === 1 ? 'disabled' : '') + '">\n        ' + (index === 1 ? 'Previous <span class="show-for-sr">page</span>' : '<a href="#" aria-label="Previous page">Previous <span class="show-for-sr">page</span></a>') + '\n      </li>';
	    var next = '\n      <li class="pagination-next ' + (index === num ? 'disabled' : '') + '">\n        ' + (index === num ? 'Next <span class="show-for-sr">page</span>' : '<a href="#" aria-label="Next page">Next <span class="show-for-sr">page</span></a>') + '\n      </li>';
	    var pages = '';
	    if (num <= 8) {
	      for (var i = 1; i <= num; i++) {
	        if (i === index) pages += '<li class="current"><span class="show-for-sr">You\'re on page</span> ' + i + '</li>';else pages += '<li><a href="#" aria-label="Page ' + i + '">' + i + '</a></li>';
	      }
	    } else {
	      if (index < 4) {
	        for (var _i = 1; _i < 4; _i++) {
	          if (_i === index) pages += '<li class="current"><span class="show-for-sr">You\'re on page</span> ' + _i + '</li>';else pages += '<li><a href="#" aria-label="Page ' + _i + '">' + _i + '</a></li>';
	        }
	        if (index === 3) pages += '<li><a href="#" aria-label="Page 4">4</a></li>';
	        pages += '<li class="ellipsis" aria-hidden="true"></li>';
	        pages += '<li><a href="#" aria-label="Page ' + num + '">' + num + '</a></li>';
	      } else if (index > num - 3) {
	        pages += '<li><a href="#" aria-label="Page 1">1</a></li>';
	        pages += '<li class="ellipsis" aria-hidden="true"></li>';
	        if (index === num - 2) pages += '<li><a href="#" aria-label="Page ' + (num - 3) + '">' + (num - 3) + '</a></li>';
	        for (var _i2 = num - 2; _i2 <= num; _i2++) {
	          if (_i2 === index) pages += '<li class="current"><span class="show-for-sr">You\'re on page</span> ' + _i2 + '</li>';else pages += '<li><a href="#" aria-label="Page ' + _i2 + '">' + _i2 + '</a></li>';
	        }
	      } else {
	        pages += '<li><a href="#" aria-label="Page 1">1</a></li>';
	        pages += '<li class="ellipsis" aria-hidden="true"></li>';
	        for (var _i3 = index - 1; _i3 <= index + 1; _i3++) {
	          if (_i3 === index) pages += '<li class="current"><span class="show-for-sr">You\'re on page</span> ' + _i3 + '</li>';else pages += '<li><a href="#" aria-label="Page ' + _i3 + '">' + _i3 + '</a></li>';
	        }
	        pages += '<li class="ellipsis" aria-hidden="true"></li>';
	        pages += '<li><a href="#" aria-label="Page ' + num + '">' + num + '</a></li>';
	      }
	    }

	    return '\n      <ul class="pagination text-center" role="navigation" aria-label="Pagination">\n        ' + previous + '\n        ' + pages + '\n        ' + next + '\n      </ul>';
	  }

	  // init
	  $('.loading').toggle();
	  var api = getToken();
	  var currentIndex = 1;
	  var data = [];
	  var displayed = [];

	  api.then(function (token) {
	    return getVenues({ token: token, limit: 99 });
	  }).then(function (venues) {
	    data = venues;
	    displayed = data;
	    currentIndex = 1;
	    $('.venues').html(displayed.slice(0, 99).map(htmlVenue).join('\n'));
	    $('.pagination-container').html(htmlPagination(data.length, currentIndex));
	    $('.loading').toggle();
	  }).catch(function (error) {
	    return $('.loading').toggle();
	  });

	  // search
	  $('.filters').on('click', '.submit', function (e) {
	    e.preventDefault();
	    var query = $('.search').find('input[type="text"]').val().trim();

	    $(e.currentTarget).prop('disabled', true);

	    if (query) {
	      $('.loading').toggle();
	      api.then(function (token) {
	        return getVenues({ query: query, token: token });
	      }).then(function (venues) {
	        data = venues;
	        displayed = data;
	        currentIndex = 1;
	        $('.venues').html(displayed.map(htmlVenue).join('\n'));
	        $('.pagination-container').html(htmlPagination(data.length, currentIndex));
	        $(e.currentTarget).prop('disabled', false);
	        $('.loading').toggle();
	      }).catch(function (error) {
	        return $('.loading').toggle();
	      });
	    }
	  });

	  $('.search').on('input', 'input', function (e) {
	    e.preventDefault();
	    var val = $(e.currentTarget).val().trim().toLowerCase();
	    displayed = data.filter(function (v) {
	      return v.ds_pdv.toLowerCase().includes(val);
	    });
	    currentIndex = 1;
	    $('.venues').html(displayed.slice(0, 99).map(htmlVenue).join('\n'));
	    $('.pagination-container').html(htmlPagination(data.length, currentIndex));
	  });

	  // pagination
	  $('.pagination-container').on('click', 'a', function (e) {
	    e.preventDefault();
	    var page = $(e.currentTarget).text();
	    if (page === 'Previous page') currentIndex -= 1;else if (page === 'Next page') currentIndex += 1;else currentIndex = parseInt(page, 10);
	    $('.venues').html(displayed.slice(currentIndex * 99, currentIndex * 99 + 99).map(htmlVenue).join('\n'));
	    $('.pagination-container').html(htmlPagination(displayed.length, currentIndex));
	    window.scrollTo(0, 0);
	  });
	})($);

/***/ }
/******/ ]);