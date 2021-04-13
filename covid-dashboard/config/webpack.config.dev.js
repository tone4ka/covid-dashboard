/* eslint-disable linebreak-style */
const path = require('path');
const config = require('./webpack.config.js');

config.devServer = {
  contentBase: path.join(__dirname, 'dst'),
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  },
  host: '127.0.0.1',
  port: 9000,
  watchContentBase: true,
  hot: true,
};

config.devtool = 'inline-source-map';

module.exports = config;
