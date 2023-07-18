const path = require('path')
const merge = require('webpack-merge')
const base = require('./webpack.base.conf')
const webpack = require('webpack')
module.exports = merge(base, {
  devServer: {
    contentBase: './dist',
    // port: '8383',
    inline: true,
    open: true,
    hot: true,
    quiet: true,
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      DEV: JSON.stringify('dev'),
    }),
  ],
})
