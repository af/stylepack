# Stylepack

Life-changing CSS workflow, leveraging the magic of [Stylus](https://learnboost.github.io/stylus/),
[Webpack](http://webpack.github.io), and [CSS Modules](https://github.com/css-modules/css-modules).
Stylepack gives you:

* CSS with all the features of Stylus
* Proper style isolation using CSS Modules (optional)
* Shared variables between your JavaScript and styles
* Support for webpack's awesome Hot Module Replacement for development mode

## Install

`npm install --save stylepack stylus`


## Usage

Simple example:

```js
// webpack.config.js

var webpackConfig = {
    // ... your existing webpack configuration ...
};

// Pass the webpack config object through this function to add
// stylus & CSS module goodness to your webpack setup:
var applyStylepack = require('stylepack')({
    webpack: require('webpack'),
    // optional stylepack config goes here
})
module.exports = applyStylepack(webpackConfig)
```

Now, say you have a `foo.styl` file in your project as follows:

```stylus
.bar
    color: red
    font-weight: bold
```

Then in your client-side JS code, you can import this stylus file, and webpack
will compile and bundle it automatically. The default import will be a hash of
classnames that you can use in your JavaScript (eg. for React components):

```js
import classes from './foo.styl'

document.body.classList.add(classes.bar)
```


## Configuration

The stylepack function takes an optional configuration object, with the following
supported keys:

* `cssModules` - Set this to `true` to enable CSS Modules
* `vars` - An object containing variables that will be available to the stylus files.
  This allows you to share variables across your stylesheets and application
  JavaScript (eg. colours, animation times, media query breakpoints).
  ```Note: nested objects and arrays are not yet supported within the vars option```
* `fileMatchRegex` - A RegExp used to match files that Stylepack will process.
  (default: `/\.styl$/`)


## TODO

* Remove webpack dependency. It's only in the package.json because extract-text-webpack-plugin
  errors out without it. Ideally you should be able to "bring your own" webpack version, without
  this plugin also requiring it directly.
