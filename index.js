var path = require('path')
var DEV_MODE = (process.env.NODE_ENV !== 'production')



var loader = ['./node_modules/style-loader',
              './node_modules/css-loader',
              './node_modules/stylus-loader'
             ].map(function(p) { return path.resolve(p) }).join('!')

module.exports = function(options) {
    options = options || {}

    console.log('stylepackin with', options, loader)
    return {
        loader: loader,
        stylusConfig: {
            use: [require('autoprefixer-stylus')]
        }
    }
}
