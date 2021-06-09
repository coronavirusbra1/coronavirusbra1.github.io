"use strict";

// Load plugins
const autoprefixer = require("autoprefixer");
const cp = require("child_process");
const csso = require('gulp-csso');
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const terser = require('gulp-terser');
const sourcemaps = require("gulp-sourcemaps");
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const version = require('gulp-version-number');
const versionConfig = {
	'value': '%MDS%',
	'append': {
		'to': [{
			'key': 'v',
			'type'  : 'js',
			'files': [ 'scripts.min.js' ]
		},
		{
			'key': 'v',
			'type'  : 'css',
			'files': [ 'style.min.css' ]
		}],
	},
};

// HTML task
function html() {
	return gulp.src([
			'templates/*.html'
		])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(version(versionConfig))
		.pipe(gulp.dest('./'));
}

// CSS task
function css() {
	return gulp
		.src([
			"assets/scss/style.scss",
		])
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: "expanded" }))
		.pipe(
			postcss([
				autoprefixer(),
			])
		)
		.pipe(csso({
			restructure: true,
			debug: false
		}))
		.pipe(concat("./style.min.css"))
		.pipe(sourcemaps.write("./assets/maps/"))
		.pipe(gulp.dest("./"));
}

// Scripts
// -- Transpile, concatenate and minify scripts
function js() {
	return gulp
		.src([
			"assets/js/scripts.js",
		])
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(concat("./scripts.min.js"))
		.pipe(terser())
		.pipe(sourcemaps.write("./assets/maps/"))
		.pipe(gulp.dest("./"));
}

// Watch files
function watchFiles() {
	gulp.watch(
		[
			'templates/*.html',
			'content/*.html',
			'assets/js/*.js',
			'assets/css/*.css'
		],
		{ usePolling: true },
		gulp.parallel(html)
	);

	gulp.watch(
		[
			"assets/scss/style.scss",
		],
		{ usePolling: true },
		gulp.parallel(css)
	);

	gulp.watch(
		[
			"assets/js/scripts.js",
		],
		{ usePolling: true },
		gulp.parallel(js)
	);
}

// Define complex tasks
const build = gulp.series(gulp.parallel(css, js, html));
const watch = gulp.parallel(watchFiles);

// Export Tasks
exports.build = build;
exports.watch = watch;
exports.default = build;
