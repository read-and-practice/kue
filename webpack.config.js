const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    './test/app.ts'
  ],
  output: {
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'babel-loader' }
    ]
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './test/index.html'
    })
  ],
}