module.exports = function (gulp, plugins, config) {
  return function () {
    const crystalJsPaths = require('../../gulp-js-paths-vendor.js');
    const crystalPaths = [];
    crystalJsPaths.map(function (path) {
      crystalPaths.push(config.srcPath + '/' + path);
    });
    return gulp.src(crystalPaths)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.concat('vendor.min.js'))
      .pipe(plugins.uglify({ output: { comments: 'some' } }))
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(gulp.dest(config.publicPath + '/js'));
  };
};
