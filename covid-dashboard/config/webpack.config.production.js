/* eslint-disable linebreak-style */
const TerserPlugin = require('terser-webpack-plugin');

const config = require('./webpack.config.js');

config.mode = 'production';

config.optimization = {
  minimize: true,
  minimizer: [new TerserPlugin({
    terserOptions: {
      // extractComments: 'all',
      compress: {
        drop_console: true,
      },
    },
  })],
};

module.exports = config;
