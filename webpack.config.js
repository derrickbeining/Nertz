const {resolve} = require('path');
const merge = require('webpack-merge');
const prodConfig = require('./webpack.prod');
const devConfig = require('./webpack.dev');

const config = {
  output: {
    path: resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.svg$|\.ttf?|\.woff$|\.woff2|\.eof|\.eot/,
        loader: 'file-loader'
      }
    ]
  }
}

module.exports = process.env === 'production' ?
  merge(config, prodConfig) :
  merge(config, devConfig);
