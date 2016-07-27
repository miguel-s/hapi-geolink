'use strict';

const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
  entry: {
    commons: [
      'whatwg-fetch',
      'jquery',
      './src/js/foundation-workaround',
      'foundation-sites/dist/foundation.min',
    ],
    login: './src/js/login',
    map: './src/js/map',
    profile: './src/js/profile',
    scrapers: './src/js/scrapers',
    venues: './src/js/venues',
  },
  output: {
    path: './public/js',
    filename: '[name].min.js',
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
  plugins: [
    new CommonsChunkPlugin({
      minChunks: 0,
      filename: 'commons.min.js',
      name: 'commons',
    }),
    new UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
};
