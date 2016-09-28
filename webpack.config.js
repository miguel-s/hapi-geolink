'use strict';

const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    commons: [
      'whatwg-fetch',
      'jquery',
      'foundation-sites/dist/foundation.min',
    ],
    login: './src/js/login',
    index: './src/js/index',
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
      {
        test: require.resolve('jquery'),
        loader: 'expose?$!expose?jQuery',
      },
    ],
  },
  externals: {
    leaflet: 'L',
    socketio: 'io',
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
