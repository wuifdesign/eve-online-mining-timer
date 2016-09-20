module.exports = function (gulp, plugins, config) {

    var catchError = function(error) {
        console.log(error.toString());
        this.emit('end');
    };

    return function () {
        var crystalJsPaths  = require('../../gulp-js-paths-custom.js');
        var crystalPaths = [];
        crystalJsPaths.map(function(path) {
            crystalPaths.push(config.srcPath + '/' + path);
        });
        return gulp.src(crystalPaths)
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat('main.min.js'))
            .pipe(plugins.uglify({ preserveComments: 'license' }))
            .on('error', catchError)
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest(config.publicPath + '/js'));
    };
};