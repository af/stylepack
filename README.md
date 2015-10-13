# Stylepack

Life-changing CSS workflow, leveraging the magic of [Stylus](https://learnboost.github.io/stylus/),
[Webpack](http://webpack.github.io), and [CSS Modules](https://github.com/css-modules/css-modules).
Stylepack gives you:

* CSS with all the features of Stylus
* Proper style isolation using CSS Modules (though you can opt-out if you like)
* Shared variables between your JavaScript and styles
* Support for webpack's awesome Hot Module Replacement for development mode


## Usage

Simple example:

```js
// In your webpack.config.js
var config = {
    // ... the rest of your webpack configuration ...
};

var addStyleConfig = require('stylepack')()
module.exports = addStyleConfig(config)
```


## Configuration

TODO
