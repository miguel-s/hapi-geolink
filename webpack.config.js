'use strict';

module.exports = {
  entry: {
    login: './src/js/login',
    map: './src/js/map',
    profile: './src/js/profile',
    scrapers: './src/js/scrapers',
    venues: './src/js/venues',
  },
  output: {
    path: './public/js',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
    ],
  },
};
