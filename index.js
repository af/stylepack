var path = require('path')
var DEV_MODE = (process.env.NODE_ENV !== 'production')


// TODO: conditionally use this as a loader in non-dev mode
// See github.com/webpack/extract-text-webpack-plugin/issues/30
//
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// ExtractTextPlugin.extract('style-loader', 'css-loader!stylus-loader')

var loader = ['./node_modules/style-loader',
              './node_modules/css-loader',
              './node_modules/stylus-loader'
             ].map(function(p) { return path.join(__dirname, p) }).join('!')

// exports.postProcessConfig = function(config) {
//     // Currently only used in production mode (without HMR)
//     // TODO: prevent styles.js from being created along with styles.css
//     // if (!DEV_MODE) config.plugins.push(new ExtractTextPlugin('styles.css'))
//     return config
// }

module.exports = function(options) {
    options = options || {}

    console.log('stylepackin with', options, loader)
    return {
        loader: loader,
        stylusConfig: {
            // See https://github.com/shama/stylus-loader/blob/master/index.js
            use: [require('autoprefixer-stylus')],
            define: options.vars || { $test: '#00f' }      // FIXME: quoted strings in stylus
        }
    }
}
