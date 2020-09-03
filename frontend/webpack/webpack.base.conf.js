/* eslint "import/no-extraneous-dependencies": ["error", {"optionalDependencies": false} ] */
const path = require('path');
const Webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlVariablesPlugin = require('html-variables-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: {
    app: [path.resolve(__dirname, '../src/index.js')]
  },
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'assets/js/[name].js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/assets/images'),
          to: 'assets/images',
          globOptions: { ignore: ['**/.DS_Store'] }
        },
        { from: path.resolve(__dirname, '../src/manifest.json'), to: 'manifest.json' }
      ]
    }),
    new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    new HtmlVariablesPlugin(process.env)
  ],
  resolve: {
    extensions: ['*', '.js', '.vue', '.json', '.scss'],
    alias: {
      '~': path.resolve(__dirname, '../src'),
      '@app': path.resolve(__dirname, '../src/App.vue'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@constants': path.resolve(__dirname, '../src/constants'),
      '@heatmap': path.resolve(__dirname, '../src/heatmap'),
      '@pages': path.resolve(__dirname, '../src/pages'),
      '@router': path.resolve(__dirname, '../src/router'),
      '@style': path.resolve(__dirname, '../src/assets/scss'),
      '@services': path.resolve(__dirname, '../src/services'),
      '@utils': path.resolve(__dirname, '../src/utils')
    }
  },
  module: {
    rules: [
      {
        test: /\.(html|htm)(\?.*)?$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [
          path.resolve(__dirname, '../src/assets/fonts')
        ],
        options: {
          // limit: 10000,
          limit: -1,
          name: 'assets/images/[ext]/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // limit: 10000,
          limit: -1,
          name: 'assets/media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [
          path.resolve(__dirname, '../src/assets/images')
        ],
        options: {
          // limit: 10000,
          limit: -1,
          name: 'assets/fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  }
};
