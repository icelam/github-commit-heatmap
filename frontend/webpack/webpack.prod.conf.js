/* eslint "import/no-extraneous-dependencies": ["error", {"optionalDependencies": false} ] */
const path = require('path');
const fs = require('fs');
const Webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const cssnano = require('cssnano');
const PrerenderSpaPlugin = require('prerender-spa-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const dotenv = require('dotenv');
const autoprefixer = require('autoprefixer');

const baseWebpackConfig = require('./webpack.base.conf');
const getClientEnvironment = require('./utils/env');

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  path.resolve(__dirname, '../.env.production.local'),
  path.resolve(__dirname, '../.env.production'),
  path.resolve(__dirname, '../.env')
].filter((dotenvFile) => fs.existsSync(dotenvFile));

console.log(`${dotenvFiles[0]} will be used.\n`);

// Load env variables
dotenv.config({
  path: dotenvFiles[0]
});

const clientEnv = getClientEnvironment('production');

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  // devtool: 'source-map',
  stats: 'errors-only',
  bail: true,
  output: {
    filename: 'assets/js/[name].[chunkhash:8].js',
    chunkFilename: 'assets/js/[name].[chunkhash:8].chunk.js'
  },
  plugins: [
    new Webpack.DefinePlugin(clientEnv.stringified),
    new Webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/css/bundle.[chunkhash:8].css'
    }),
    new PrerenderSpaPlugin({
      staticDir: path.join(__dirname, '../dist'),
      routes: ['/'],
      postProcess(renderedRoute) {
        renderedRoute.html = renderedRoute.html.replace(/<script (.*?)src="(.*?)google(.*?)"(.*?)><\/script>/g, '');
        return renderedRoute;
      }
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: false,
      skipWaiting: false,
      globIgnores: ['**/.DS_Store'],
      offlineGoogleAnalytics: true
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../bundle-analyzer-plugin-report.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            envName: 'production'
          }
        }]
      },
      {
        test: /\.s?css/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../'
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer(),
                cssnano(
                  {
                    preset: ['default', {
                      discardComments: {
                        removeAll: true
                      }
                    }]
                  }
                )
              ]
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
});
