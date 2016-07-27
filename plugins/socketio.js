'use strict';

const socketio = require('socket.io');
const sockets = require('../controllers/sockets.js');

const internals = {};

exports.register = (server, options, next) => {
  const io = socketio(server.listener);
  sockets(io);

  return next();
};

exports.register.attributes = {
  name: 'Socketio',
};
