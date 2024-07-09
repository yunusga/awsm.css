/* requires */

const { src, dest, series, watch }        = require('gulp');
const util		  = require('gulp-util');
const browserSync = require('browser-sync');
const cache       = require('gulp-cached');
const fileinclude = require('gulp-file-include');
const rename      = require('gulp-rename');
const concat      = require('gulp-concat');
const filter      = require('gulp-filter');
const rimraf      = require('rimraf');

const autoprefixer = require('autoprefixer');
const nocomments   = require('postcss-discard-comments');
const sass         = require('gulp-sass')(require('node-sass'));
const postcss      = require('gulp-postcss');
const minifyCSS    = require('gulp-minify-css');

/* paths */

const input = {
	html: 'dev/example/**/*.html',
	scss: 'dev/scss/**/*.scss',
	images: 'dev/example/images/*'
};

const output = {
	dist: 'dist',
	main: 'example',
	css: 'example/css',
	images: 'example/images'
};

function markup() {
	return src(input.html)
		.pipe(fileinclude().on('error', util.log))
		.pipe(cache('htmling'))
		.pipe(filter(['*', '!dev/example/includes']))
		.pipe(dest(output.main))
		.pipe(browserSync.stream());
};

function styles() {
	return src(input.scss)
		.pipe(concat('awsm.scss'))
		.pipe(sass().on('error', util.log))

		.pipe(postcss([ autoprefixer(), nocomments() ]))
		.pipe(dest(output.css))
		.pipe(dest(output.dist))

		.pipe(minifyCSS())
		.pipe(rename('awsm.min.css'))
		.pipe(dest(output.css))
		.pipe(dest(output.dist))

		.pipe(browserSync.stream());
};

function images() {
	return src(input.images)
		.pipe(dest(output.images))
		.pipe(browserSync.stream());
};

function server(cb) {
	browserSync.init({
		server: output.main,
		open: false,
		browser: "browser",
		reloadOnRestart: true
	});

	cb();
};

function watchFiles(cb) {
	watch(input.html, markup);
	watch(input.scss, styles);
	watch(input.images, images);

	cb();
};

function clean(cb) {
	rimraf(output.main, cb);
};

exports.build = series(markup, styles, images);
exports.default = series(markup, styles, images, watchFiles, server);
