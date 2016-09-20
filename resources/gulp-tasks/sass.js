module.exports = function (gulp, plugins, config) {
    return function () {
        gulp.src(config.srcPath + '/sass/main.scss')
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.cssimport({ extensions: ['css'] }))
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.cleanCss())
            .on('error', function(e) { plugins.util.log(e); })
            .pipe(plugins.rename({ suffix: '.min' }))
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest(config.publicPath + '/css'));
    };
};