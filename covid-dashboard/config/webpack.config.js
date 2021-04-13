/* eslint-disable linebreak-style */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const ROOT_DIRECTORY = path.join(__dirname, '..');
const SRC_DIRECTORY = path.join(ROOT_DIRECTORY, 'src');

const config = {
  entry: [
    path.join(SRC_DIRECTORY, 'app/app.js'),
  ],
  output: {
    path: path.join(ROOT_DIRECTORY, 'dst'),
    filename: 'script.js',
  },
  mode: 'development',
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new CopyWebpackPlugin(
      {
        patterns: [
          { from: path.join(SRC_DIRECTORY, 'assets'), to: path.join(ROOT_DIRECTORY, 'dst/assets') },
          { from: path.join(SRC_DIRECTORY, 'app/modules/keyboard/assets'), to: path.join(ROOT_DIRECTORY, 'dst/assets') },
        ],
      },
    ),
    new HtmlWebpackPlugin({
      template: path.join(SRC_DIRECTORY, 'index.html'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          SRC_DIRECTORY,
        ],
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(svg|png|jp(e*)g|gif|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.sass$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(ROOT_DIRECTORY, 'dst'),
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
  },
};

module.exports = config;
