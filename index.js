var debug = require('debug')('stylepack')
var path = require('path')
var stylus = require('stylus')
var DEV_MODE = (process.env.NODE_ENV !== 'production')


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
            // TODO: Will probably want to add support for arrays/objects/etc later.
            // See https://github.com/stylus/stylus/tree/dev/lib/nodes
            var v = variableHash[k]
            if (v.match(/^rgba\(/)) {
                // Support for rgba() string variables
                var m = v.match(/^rgba\((\d+), *(\d+), *(\d+), *([\d\.]+)\)/)
                if (!m) break
                var rgba = m.slice(1, 5).map(x => parseFloat(x))
                style.define(k, new stylus.nodes.RGBA(...rgba))
            } else if (v[0] === '#') {
                // Support for hex colour string variables (#abcabc)
                var m = v.match(/^\#([0-9a-f]{1,2})([0-9a-f]{1,2})([0-9a-f]{1,2})$/)
                if (!m) break
                var rgb = m.slice(1, 4).map(x => parseInt(x, 16))
                style.define(k, new stylus.nodes.RGBA(...rgb, 1))
            } else {
                // Support for regular string literals
                style.define(k, new stylus.nodes.Literal(v))
            }
        }
    }
}

module.exports = function(options) {
    options = options || {}

    // Set up the full chained loader string to pass to webpack for handling
    // stylus files:
    var loader = [
        '../style-loader',
        '../css-loader',
        '../stylus-loader'
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
        if (!webpackConfig.module) webpackConfig.module = {}

        var regex = options.fileMatchRegex || /\.styl$/
        var loaderConfig = webpackConfig.module.loaders
        var loaderSpec = { test: regex, loader: loader }
        webpackConfig.module.loaders = loaderConfig
            ? loaderConfig.concat(loaderSpec)
            : [loaderSpec]

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
