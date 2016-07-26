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
	        var list = payload.list;

	        var element = $('.' + origin);
	        element.find('.update').hide();
	        element.find('.stop').show();
	        element.find('.progress').show();
	        element.find('input[type="radio"][value="' + list + '"]').prop('checked', true);
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

/***/ }
/******/ ]);