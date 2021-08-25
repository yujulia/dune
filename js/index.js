import Rellax from 'Rellax';
import prefetchImages from 'prefetch-image';

// ---------------------------------- generate images to load
const imagePath = "deploy/img/";

let singles = [
  'sky',
  'baron-dark',
  'baron',
  'bubble-bottom',
  'bubble-top',
  'goldenpath',
  'moon',
].map(function(e) {
	return imagePath + e + ".png";
});

let pairs = [
	'arrakis',
  'dune',
  'fedaykin',
  'fireplace',
  'gomjabbar',
  'keep',
  'muaddib',
  'sardaukar',
  'shaihulud',
  'twomoons',
  'water',
  'witch',
].flatMap((e) => [ imagePath + "fore-" + e + ".png", imagePath + "back-" + e + ".png"])

let rooms = Array.from({length: 8}, (_, index) => imagePath + "room-" + index + ".png");


// ---------------------------------- start parallax plugin

function initializeParallax() {
	var rellax = new Rellax('.rellax', {
		center: true,
		breakpoints: [576, 768, 1201],
	});
}

// ---------------------------------- preload 

function preload() {
	var images = [].concat(singles, pairs, rooms)

	prefetchImages(images)
	  .then(() => {
	    console.log('all images loaded!');

	    document.body.classList.add("stars")
	    document.getElementById("preloader").remove()
	    
	    initializeParallax();
	}); 
}

// ---------------------------------- on load

function onLoad() { 
	preload(); 
}

document.addEventListener("DOMContentLoaded", onLoad);