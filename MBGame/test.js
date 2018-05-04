var req;
// var data;
// var stopped = false;
var threadID;
var canvas, context;
const rectWidth = 5;
const fillStyle = [randomColorString(), randomColorString()];
const agentStyle = [randomColorString(), randomColorString()];
const clearStyle = "#FFFFFF";
const agentCount = 2;
var actionId = 0;
var timeInterval = 50;
var directions = ["down", "up"];
var positions = [[30, 30], [100, 100]]
const directionWays = {
	"up"   : [0, -1],
	"down" : [0, 1],
	"left" : [-1, 0],
	"right": [1, 0],
}
const directionStrings = [
	"up", "right", "down", "left" // 0, 1, 2, 3
]

function getDirectionString(dirNum){
	return directionStrings[dirNum];
}

function randomColor(){
	return parseInt((Math.random() * 256).toFixed()).toString(16);
}

function randomColorString(){
	return "#" + randomColor() + randomColor() + randomColor();
}

function drawRect(context, x, y, id, isPoint = false){
	// x, y ranges from 0 to 119
	if(isPoint){
		context.fillStyle = agentStyle[id];
	}else{
		context.fillStyle = fillStyle[id];
	}
	context.fillRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
}

function clearRect(context, x, y){
	// context.fillStyle = clearStyle;
	context.clearRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
}

function updateView(data){
	canvas = document.getElementById("game");
	var dummy_key = -1;
	// for(key in data){
	// 	dummy_key = key;
	// }
	// if(dummy_key == -1){
	// }
	console.log(data);
	for(key in data){
		action = data[key];
		if(action.direction != 4){
			directions[action.id - 1] = getDirectionString(action.direction);
			// -1, id: 1 => i-1th in position
		}
	}
	for (var i = directions.length - 1; i >= 0; i--) {
		var directionWay = directionWays[directions[i]];
		drawRect(context, positions[i][0], positions[i][1], i, false);
		// replace last point
		for(var j = 0; j <= 1; j++){
			if((positions[i][j] == 0 && directionWay[j] == -1) ||
			 (positions[i][j] == 119 && directionWay[j] == 1)){
			}else{
				positions[i][j] += directionWay[j];
			}
		}
		drawRect(context, positions[i][0], positions[i][1], i, true);
		// draw current agent
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

	resetButton = document.getElementById("reset");
	resetButton.addEventListener("click", function(){
		context.clearRect(0, 0, 600, 600);
	})

	threadID = setInterval(function(){
		req = new XMLHttpRequest();
		req.open(
			"GET",
			"/pr/game/check",
			);
		req.onreadystatechange = stateChange;
		req.send(null);
	}, timeInterval);
};
