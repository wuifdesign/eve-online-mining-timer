# EVE Online - Mining Timer

## Status

* [![release-version](https://img.shields.io/badge/v0.0.1-Live-success.svg)](https://wuifdesign.github.io/eve-online-mining-timer)

Keep track of your mining lasers and strip miners to optimize your yield.

#####Never run empty mining circles again.


## Required / Recommended Modules

* [![node-js](https://img.shields.io/badge/nodejs-v10.16.3-brightgreen.svg?style=flat-square)](https://nodejs.org/en/)
* [![npm](https://img.shields.io/badge/npm-v6.14.5-brightgreen.svg?style=flat-square)](https://nodejs.org/en/)
* [![gulp](https://img.shields.io/badge/gulp-v3.9.1-brightgreen.svg?style=flat-square)](https://gulpjs.com/)


## Development Setup

To get setup git clone the project and run npm

```
cd eve-online-mining-timer
npm install
```

Open your code editor of choice the parent directory of the project
```
code .
```

To watch the project folder for changes
```
gulp watch
```

To view live changes use a local server like [live-server](https://www.npmjs.com/package/live-server) on the compiled source
```
cd docs/
live-server --watch='.'
```