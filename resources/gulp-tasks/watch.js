module.exports = function (gulp, plugins, config) {
    return function () {
        gulp.watch([config.srcPath + '/sass/**/*.scss'], ['sass']);
        gulp.watch([config.srcPath + '/js/**/*.js'], ['js']);
    };
};