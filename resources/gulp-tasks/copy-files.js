module.exports = function (gulp, plugins, config) {
    return function () {
        gulp.src(config.srcPath + '/components/**/*.{png,jpg,gif}', { base: config.srcPath + '/components' }).pipe(gulp.dest(config.publicPath + '/img/vendor'));

        gulp.src(config.srcPath + '/components/bootstrap-sass/**/*.{eot,svg,ttf,woff,woff2}', { base: config.srcPath + '/components' }).pipe(gulp.dest(config.publicPath + '/fonts'));
        gulp.src(config.srcPath + '/components/font-awesome/**/*.{eot,svg,ttf,woff,woff2}', { base: config.srcPath + '/components' }).pipe(gulp.dest(config.publicPath + '/fonts'));
        gulp.src(config.srcPath + '/components/slick-carousel/**/*.{eot,svg,ttf,woff,woff2}', { base: config.srcPath + '/components' }).pipe(gulp.dest(config.publicPath + '/fonts'));
    };
};