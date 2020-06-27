module.exports = function(gulp, plugins, config) {
  return function() {
    return gulp.src('node_modules').pipe(gulp.symlink(config.srcPath));
  };
};
