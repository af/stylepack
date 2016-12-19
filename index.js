const debug = require('debug')('stylepack')
const path = require('path')
const stylus = require('stylus')
const extractPlugin = require('extract-text-webpack-plugin')
const DEV_MODE = (process.env.NODE_ENV !== 'production')


const stylusVarHelper = variableHash => style => {
    debug(`Using stylus variable helper with: ${JSON.stringify(variableHash)}`)
    for (let k in variableHash) {
        // TODO: Will probably want to add support for arrays/objects/etc later.
        // See https://github.com/stylus/stylus/tree/dev/lib/nodes
        const v = variableHash[k]
        if (v.match(/^rgba\(/)) {
            // Support for rgba() string variables
            const m = v.match(/^rgba\((\d+), *(\d+), *(\d+), *([\d\.]+)\)/)
            if (!m) break
            const rgba = m.slice(1, 5).map(x => parseFloat(x))
            style.define(k, new stylus.nodes.RGBA(...rgba))
        } else if (v[0] === '#') {
            // Support for hex colour string variables (#abcabc)
            const m = v.match(/^\#([0-9a-f]{1,2})([0-9a-f]{1,2})([0-9a-f]{1,2})$/)
            if (!m) break
            const rgb = m.slice(1, 4).map(x => parseInt(x, 16))
            style.define(k, new stylus.nodes.RGBA(...rgb, 1))
        } else {
            // Support for regular string literals
            style.define(k, new stylus.nodes.Literal(v))
        }
    }
}

module.exports = (options = {}) => {
    const {cssModules=true, fileMatchRegex=/\.styl$/, extractTo, vars} = options

    // Configure module rules for webpack 2
    // See https://github.com/shama/stylus-loader#webpack-2
    const getPath = p => require.resolve(p)
    const loaders = [
        {loader: getPath('style-loader')},
        {
            loader: getPath('css-loader'),
            options: {
                minimize: !DEV_MODE,        // FIXME: this doesn't seem to work
                importLoaders: 1,

                // Css module configuration options
                // See https://github.com/webpack/css-loader
                cssModules,
                localIdentName: '[name]__[local]__[hash:base64:5]'
            }
        },
        {
            loader: getPath('stylus-loader'),
            options: {
                use: [
                    vars && stylusVarHelper(vars)
                ].filter(x => !!x)
            }
        }
    ]
    debug(`loaders: ${loaders}`)

    // Return a function that takes a webpack config object, and spits out
    // a modified config with our stylus options included:
    return (webpackConfig = {}) => {
        if (!webpackConfig.module) webpackConfig.module = {}
        if (!webpackConfig.plugins) webpackConfig.plugins = []

        const rules = webpackConfig.module.rules || []
        const loaderSpec = {test: fileMatchRegex, use: loaders}

        // TODO: support multiple extract-text bundles by passing an array instead
        // of a string (as extractTo)
        if (extractTo) {
            webpackConfig.plugins.push(new extractPlugin(extractTo))
            // Note! This should be `loaderSpec.use` but that doesn't work yet
            // see https://github.com/webpack/extract-text-webpack-plugin/issues/282
            loaderSpec.loader = extractPlugin.extract({
                // We don't want to use the style loader with extract-text-webpack-plugin,
                // hence the slice() below. See http://stackoverflow.com/a/35369247/351433
                loader: loaders.slice(1),
                fallbackLoader: getPath('style-loader')
            })
            delete loaderSpec.use
        }

        webpackConfig.module.rules = rules
            ? rules.concat(loaderSpec)
            : [loaderSpec]

        return webpackConfig
    }
}
