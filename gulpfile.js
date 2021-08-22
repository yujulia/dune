/** -------------------------------------------------------- 
*/

const { series, parallel, src, dest, watch } = require('gulp');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat')
const merge = require('merge-stream')


/** -------------------------------------------------------- 
*/

function styles() {
	console.log("SASSing...")

	var normStream = src('node_modules/normalize.css/normalize.css')
	var sassStream = src('sass/**/*.{scss,sass}')
		.pipe(sass().on('error', sass.logError))

	return merge(normStream, sassStream)
		.pipe(concat('main.css'))
		.pipe(dest('css/'))
}

function watcher() {
	console.log("Watching...")
	watch(['sass/**/*.{scss,sass}'], styles)
}

/** -------------------------------------------------------- 
*/

// function test() {
// 	console.log("test...")
// 	return src('js/*.js')
// 	    .pipe(babel())
// 	    .pipe(uglify())
// 	    .pipe(rename({ extname: '.min.js' }))
// 	    .pipe(dest('js/'));
// }

/** -------------------------------------------------------- public tasks
*/


exports.default = watcher