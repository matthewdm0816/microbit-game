var req;
// var data;
// var stopped = false;
var threadID;
var canvas, context;
const rectWidth = 5;
const fillStyle = "#CC33FF";
const clearStyle = "#FFFFFF";
var actionId = 0;

function randomColor(){
	return parseInt((Math.random() * 256).toFixed()).toString(16);
}

function randomColorString(){
	return "#" + randomColor() + randomColor() + randomColor();
}

function drawRect(context, x, y){
	// x, y ranges from 0 to 119
	context.fillStyle = fillStyle;
	context.fillRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
}

function clearRect(context, x, y){
	// context.fillStyle = clearStyle;
	context.clearRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
}

function updateView(data){
	canvas = document.getElementById("game");
	for(key in data){
		console.log(key + ": ");
		console.log(data[key]);
	}
}

function stateChange(){
	if(req.readyState == 4){
		if(req.status == 200){
			data = JSON.parse(req.responseText);
			updateView(data);
		}else{
			alert("Problem retrieving data");
			// stopped = true;
			clearInterval(threadID);
		}
	}
};
window.onload = function(){
	canvas = document.getElementById("game");
	context = canvas.getContext("2d");
	context.fillStyle = fillStyle;
	threadID = setInterval(function(){
		req = new XMLHttpRequest();
		req.open(
			"GET",
			"/pr/game/check",
			);
		req.onreadystatechange = stateChange;
		req.send(null);
	}, 200);
};
