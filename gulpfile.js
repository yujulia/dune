/** -------------------------------------------------------- 
*/
const { series, parallel, src, dest, watch } = require('gulp');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const merge = require('merge-stream');
const log = require('gulplog');

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const uglify = require('gulp-uglify');

const sass = require('gulp-sass')(require('sass'));


/** -------------------------------------------------------- 
 * Concat css and sass streams after compiling sass
*/

function styles() {
	console.log("SASSing...");

	var normStream = src('node_modules/normalize.css/normalize.css');
	var sassStream = src('sass/**/*.{scss,sass}')
		.pipe(sass().on('error', sass.logError));

	return merge(normStream, sassStream)
		.pipe(concat('main.css'))
		.pipe(dest('deploy/'));
}

/** -------------------------------------------------------- 
*/

function scripts() {
	var options = {
		entries: ['js/index.js'],
  		debug: true,
  		transform: ['babelify'],
	};

	console.log("browserify...")
	return browserify(options)
		.bundle()
		.on('error', log.error.bind(log, 'Browserify Error'))
		.pipe(source('bundle.js'))
		.pipe(dest('deploy/'));
}

/** -------------------------------------------------------- 
 * who watches the watcher
*/

function watcher() {
	console.log("Watching...");
	parallel(scripts, styles);
	watch(['sass/**/*.{scss,sass}'], { ignoreInitial: false }, styles);
	watch(['js/**/*.js'], { ignoreInitial: false }, scripts);
}

/** -------------------------------------------------------- public tasks
*/

exports.default = watcher;
