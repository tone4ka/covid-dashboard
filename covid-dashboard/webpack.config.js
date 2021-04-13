const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')


const ROOT_DIRECTORY = __dirname
const SRC_DIRECTORY = path.join(ROOT_DIRECTORY, 'src')

module.exports = {
  entry: [
    './src/app/app.js'
  ],
  output: {
    path: path.join(__dirname, 'dst'),
    filename: 'script.js'
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dst'),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    host: '127.0.0.1',
    port: 9000,
    watchContentBase: true,
    hot: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_DIRECTORY, 'index.html')
    }),
  //   new CopyWebpackPlugin(
  //     {patterns:  [
  //    { from: path.join(SRC_DIRECTORY, 'assets'), to: path.join(ROOT_DIRECTORY, 'dst/assets') }
  //  ]},
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'src')
        ],
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.sass$/,
        // use: [
        //   MiniCssExtractPlugin.loader,
        //   'css-loader',
        //   {
        //     loader: 'postcss-loader',
        //     options: {
        //       ident: 'postcss',
        //       plugins: [
        //         require('autoprefixer'),
        //         require('cssnano')
        //       ]
        //     }
        //   },
        //   'sass-loader',
        // ],
        use: [{
          loader: MiniCssExtractPlugin.loader,
        }, {
          loader: "css-loader",
        }, {
          loader: "sass-loader",
          options: {
            implementation: require("sass"),
            //fiber: Fiber
          }
        }]
      },
      {
        test: /\.(png|jpe?g|gif|mp3|wav|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets',
            },
          },
        ],
      }
    ],
  },
  optimization: {
    minimize: true
  }
};
