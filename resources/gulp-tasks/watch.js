module.exports = function (gulp, plugins, config) {
  return function () {
    gulp.watch([config.srcPath + '/sass/**/*.scss'], gulp.series('sass'));
    gulp.watch([config.srcPath + '/js/**/*.js'], gulp.series('js'));
  };
};
