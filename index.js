var debug = require('debug')('stylepack')
var path = require('path')
var stylus = require('stylus-loader/node_modules/stylus')
var DEV_MODE = (process.env.NODE_ENV !== 'production')

require('es6-promise').polyfill()       // Needed to run postcss on node 0.10.x


// TODO: conditionally use this as a loader in non-dev mode
// See github.com/webpack/extract-text-webpack-plugin/issues/30
//
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// ExtractTextPlugin.extract('style-loader', 'css-loader!stylus-loader')

// exports.postProcessConfig = function(config) {
//     // Currently only used in production mode (without HMR)
//     // TODO: prevent styles.js from being created along with styles.css
//     // if (!DEV_MODE) config.plugins.push(new ExtractTextPlugin('styles.css'))
//     return config
// }

function stylusVarHelper(variableHash) {
    return function(style) {
        debug('Using stylus variable helper with: ' + JSON.stringify(variableHash))
        for (var k in variableHash) {
            // TODO: only support for literals at the moment- this works
            // well for strings like '32px' and '#f00' but we'll probably
            // want to add support for arrays/objects/etc later.
            // See https://github.com/stylus/stylus/tree/dev/lib/nodes
            style.define(k, new stylus.nodes.Literal(variableHash[k]))
        }
    }
}

module.exports = function(options) {
    options = options || {}

    // Set up the full chained loader string to pass to webpack for handling
    // stylus files:
    var loader = [
        './node_modules/style-loader',
        './node_modules/css-loader',
        './node_modules/stylus-loader'
    ].map(function(p) {
        var enableCSSModules = (options.cssModules !== false) && p.match(/\/css-loader$/)
        var moduleFormat = DEV_MODE ? '&localIdentName=[name]__[local]___[hash:base64:5]' : ''
        var suffix = enableCSSModules ? ('?modules&importLoaders=1' + moduleFormat) : ''
        if (enableCSSModules) debug('Enabling CSS modules')
        return path.join(__dirname, p) + suffix
    }).join('!')

    debug('init with options: ' + JSON.stringify(options))
    debug('loader: ' + loader)

    // Return a function that takes a webpack config object, and spits out
    // a modified config with our stylus options included:
    return function(webpackConfig) {
        webpackConfig = webpackConfig || {}

        // FIXME: ensure module.loaders is an array here
        var regex = options.fileMatchRegex || /\.styl$/
        webpackConfig.module.loaders.push({ test: regex, loader: loader })

        webpackConfig.stylus = {
            // See https://github.com/shama/stylus-loader/blob/master/index.js
            use: [
                options.autoprefix && require('autoprefixer-stylus'),
                options.vars && stylusVarHelper(options.vars)
            ].filter(function(x) { return !!x }),
        }

        return webpackConfig
    }
}
