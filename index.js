const debug = require('debug')('stylepack')
const path = require('path')
const stylus = require('stylus')
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
    const {cssModules=true, fileMatchRegex=/\.styl$/, autoprefix=true, vars} = options
    debug(`init with options: ${JSON.stringify(options)}`)

    // Css module configuration
    const moduleFormat = DEV_MODE ? '&localIdentName=[name]__[local]___[hash:base64:5]' : ''
    const CSSMSuffix = cssModules ? ('?modules&importLoaders=1' + moduleFormat) : ''
    if (cssModules) debug('Enabling CSS modules')

    // Configure module rules for webpack 2
    // See https://github.com/shama/stylus-loader#webpack-2
    const getPath = p => require.resolve(p)
    const loaders = [
        getPath('style-loader'),
        getPath('css-loader') + CSSMSuffix,
        {
            loader: 'stylus-loader',
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

        const rules = webpackConfig.module.rules || []
        const loaderSpec = {test: fileMatchRegex, use: loaders}
        webpackConfig.module.rules = rules
            ? rules.concat(loaderSpec)
            : [loaderSpec]

        return webpackConfig
    }
}
