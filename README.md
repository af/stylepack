# Stylepack

Life-changing CSS workflow, leveraging the magic of [Stylus](https://learnboost.github.io/stylus/),
[Webpack](http://webpack.github.io), and [CSS Modules](https://github.com/css-modules/css-modules).
Stylepack gives you:

* CSS with all the features of Stylus
* Proper style isolation using CSS Modules (though you can opt-out if you like)
* Shared variables between your JavaScript and styles
* Support for webpack's awesome Hot Module Replacement for development mode
* [autoprefixer](https://github.com/postcss/autoprefixer) built in by default


## Usage

Simple example:

```js
// In your webpack.config.js
var config = {
    // ... the rest of your webpack configuration ...
};

var addStyleConfig = require('stylepack')({ /* optional config goes here */ })
module.exports = addStyleConfig(config)
```


## Configuration

The stylepack function takes an optional configuration object, with the following
supported keys:

* `cssModules` - Set this to `false` to disable CSS Modules (they're on by default)
* `vars` - An object containing variables that will be available to the stylus files.
  This allows you to share variables across your stylesheets and application
  JavaScript (eg. colours, animation times, media query breakpoints).
  ```Note: nested objects and arrays are not yet supported within the vars option```
* `fileMatchRegex` - A RegExp used to match files that Stylepack will process.
  (default: `/\.styl$/`)
* `autoprefix` - Set this to `false` to disable autoprefixer (it's on by default)
