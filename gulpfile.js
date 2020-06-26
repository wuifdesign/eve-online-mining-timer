'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const getTask = (task, extra) => {
  return require(config.srcPath + '/../gulp-tasks/' + task)(gulp, plugins, config, extra);
};

const config = {
  getTask: getTask,
  srcPath: './resources/assets', //change to your source path
  publicPath: './docs/assets', //change to your target path
};

gulp.task('symlink', getTask('symlink'));
gulp.task('copy-files', getTask('copy-files'));
gulp.task('sass', getTask('sass'));
gulp.task('js', getTask('js'));
gulp.task('js-vendor', getTask('js-vendor'));
gulp.task('watch', getTask('watch'));

gulp.task('default', gulp.parallel('copy-files', 'sass', 'js-vendor', 'js'));
