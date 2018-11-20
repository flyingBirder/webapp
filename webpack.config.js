const webpack = require('webpack')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')


// 获取指定路径下的入口文件
function getEntries (globPath) {
  const files = glob.sync(globPath)
  const entries = {}
  files.forEach(function (filepath) {
    const split = filepath.split('/')
    const name = split[split.length - 2]
    entries[name] = './' + filepath
  })
  return entries;
}

const entries = getEntries('src/views/**/index.js')
const isProduction = process.env.NODE_ENV === 'production'
const webpackConfig = {
  //页面入口文件配置
  entry: {},

  //入口文件输出配置
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: isProduction ? 'js/[name].[chunkhash:6].js' : 'js/[name].js',
  },
  // 设置开发者工具的端口号,不设置则默认为8080端口
  devServer: {
    hot: true,
    inline: true,
    port: 8080,
    contentBase: path.resolve(__dirname, './src')
  },
module: {
    //加载器配置
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
          plugins: [['import', { 'libraryName': 'antd', 'libraryDirectory': 'lib', 'style': true }]]
        }
      },
      {
        test: /\.(scss|sass|css)$/,
        loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader'})
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader'
      },
      {
        test: /\.(less)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
              {loader: 'css-loader'},
              {loader: 'less-loader'}
          ]
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png)(\?\S*)?$/,
        loader: 'file-loader?name=images/[hash:8].[name].[ext]'
      }
    ]
  },
//插件
  plugins: [
    new ExtractTextPlugin('[name].[chunkhash:6].css'),
    new CleanWebpackPlugin(
      ['dist'],
      {
        root: __dirname,
        verbose: true,
        dry: false
      }
    )
  ],
  //开发环境的调试
  devtool: isProduction ? '' : 'source-map'
}

Object.keys(entries).forEach(function (name) {
  webpackConfig.entry[name] = entries[name]
  const plugin = new HtmlWebpackPlugin({
    filename: name + '.html',
    template: './src/index.html',
    inject: true,
    chunks: [name],
    minify: { // 压缩HTML文件
      removeComments: true, // 移除HTML中的注释
      collapseWhitespace: false // 删除空白符与换行符
    }
  })
  webpackConfig.plugins.push(plugin)
})

module.exports = webpackConfig
