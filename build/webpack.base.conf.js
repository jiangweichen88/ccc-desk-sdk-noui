const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}
// 'babel-polyfill',
module.exports = {
  entry: ['./src/index.js'],
  output: {
    library: 'cccDeskSDK',
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: path.resolve(__dirname, '../dist'),
    filename: 'cccDeskSDK.[hash:8].js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      minify: {
        removeAttributeQuotes: true,
        // collapseWhitespace: true,
      },
      hash: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/, //普通的loader
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.(gif|png|jpg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              //图片小于10kb就是图片地址，大于正常打包成base64格式编码
              limit: 10000,
              //输出路径
              outputPath: 'img/',
            },
          },
        ],
      },
      {
        test: /\.(mp3|wav)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'media/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
}
