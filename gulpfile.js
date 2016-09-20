'use strict';

var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();

var config = {
    getTask: getTask,
    srcPath: './resources/assets', //change to your source path
    publicPath: './docs/assets' //change to your target path
};

function getTask(task, extra) {
    return require(config.srcPath + '/../gulp-tasks/' + task)(gulp, plugins, config, extra);
}

gulp.task('copy-files', getTask('copy-files'));
gulp.task('sass', getTask('sass'));
gulp.task('js', getTask('js'));
gulp.task('js-vendor', getTask('js-vendor'));
gulp.task('watch', getTask('watch'));

//Generates Sprite images and adds the image to the "sprites_path" and the SCSS-files to "sass/custom/sprites"
gulp.task('sprite', getTask('sprite', {
    enable_retina_sprites: false, //Enable retina sprites which are defined as "filename@2x.png" and have to be exactly double the size of the normal image
    sprites_path: config.publicPath + '/img/sprites/', //Path to the spite images
    relative_sprites_path: '../img/sprites/', //Relative path to the spite images (used in the css after compiling)
    sprites: [ /* 'base' */ ] //add folder names of the sprites. (if folder is "../img/sprites/base" add "base" to the array
}));

gulp.task('default', ['copy-files', 'sass', 'js-vendor', 'js']);