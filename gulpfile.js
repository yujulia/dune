/** -------------------------------------------------------- 
*/
const { series, parallel, src, dest, watch } = require('gulp');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const merge = require('merge-stream');
const log = require('gulplog');

const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const sass = require('gulp-sass')(require('sass'));

const image = require('gulp-image')


/** -------------------------------------------------------- 
 * Compress image
*/


function min() {
	return src('img/*')
    .pipe(image())
    .pipe(dest('deploy/img/'));
}


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
	return src('js/*.js')
		.pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
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

exports.min = min;
exports.default = watcher;
