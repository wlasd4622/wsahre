// https://github.com/michael-ciniawsky/postcss-load-config
let plugins = {
  "postcss-import": {},
  "postcss-url": {},
  "autoprefixer": {}
}
if (process.env.NODE_ENV !== 'development') {
  plugins['postcss-px-to-viewport'] = {
    viewportWidth: 375, // (Number) The width of the viewport.
    viewportHeight: 1334, // (Number) The height of the viewport.
    unitPrecision: 3, // (Number) The decimal numbers to allow the REM units to grow to.
    viewportUnit: 'vw', // (String) Expected units.
    selectorBlackList: ['.bullet-ignore', '.bullet-active-ignore'], // (Array) The selectors to ignore and leave as px.
    minPixelValue: 1, // (Number) Set the minimum pixel value to replace.
    mediaQuery: false // (Boolean) Allow px to be converted in media queries.
  }
}
module.exports = {
  plugins
}
