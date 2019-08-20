const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    tmp :'./src/tmp.jsx',
    index :'./src/index.jsx',
    brain :'./src/brain.jsx',
    bookmark : './src/Bookmark.jsx',
    lightning : './src/lightning.jsx'
  },
  mode: 'development',
  node: {
    fs : 'empty'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: { extensions: ['*', '.js', '.jsx'] },

  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/dist/',
    filename: '[name].bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'public/'),
    port: 3000,
    publicPath: 'http://localhost:3000/dist/',
    hotOnly: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}

