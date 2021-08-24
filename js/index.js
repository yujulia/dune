import Rellax from 'Rellax'

function onLoad() {
	var rellax = new Rellax('.rellax', {
	    center: true,
	    breakpoints: [576, 768, 1201],
	  });
}

document.addEventListener("DOMContentLoaded", onLoad);