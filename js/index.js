import Rellax from 'Rellax';
import prefetchImages from 'prefetch-image';

// ---------------------------------- generate images to load
const imagePath = "deploy/img/";

let skySource = imagePath + "sky.png";

let singles = [
  'baron-dark',
  'baron',
  'bubble-bottom',
  'bubble-top',
  'goldenpath',
  'moon',
  'title',
  'title-black'
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
].flatMap((e) => [ imagePath + "fore-" + e + ".png", imagePath + "back-" + e + ".png"]);

let rooms = Array.from({length: 8}, (_, index) => imagePath + "room-" + index + ".png");

let roomsMobile1 = [1,2,3,4,5,6,7].map(function(e) { 
	return imagePath + "room-" + e + "-0.png";
});


let roomsMobile2 = [1,2,3,4,7].map(function(e) { 
	return imagePath + "room-" + e + "-1.png";
});

let roomsMobile3 = [
	"fore-arrakis-0",
	"fore-arrakis-1",
	"back-arrakis-0",
	"back-arrakis-1",
].map(function(e) { 
	return imagePath + e + ".png";
});

// ---------------------------------- start parallax plugin

function initializeParallax() {
	var rellax = new Rellax('.rellax', {
		center: true,
		breakpoints: [576, 768, 1201],
	});
}

// ---------------------------------- preload 

function preload() {
	var images = [].concat(singles, pairs, rooms, roomsMobile1, roomsMobile2, roomsMobile3);

	console.log("images", images);

	prefetchImages(images)
	  .then(() => {
	    document.body.classList.add("loaded")
	    document.getElementById("preloader").remove()
	    document.getElementById("sky").remove()
	    
	    initializeParallax();
	}); 
}

function loadSky() {
		prefetchImages([skySource])
	  .then(() => {
	    document.body.classList.add("skyLoaded")

	    // setTimeout(function() { preload(); }, 5000);
	    preload(); 
	}); 
}

// ---------------------------------- on load

function onLoad() { 
	loadSky();
}

document.addEventListener("DOMContentLoaded", onLoad);