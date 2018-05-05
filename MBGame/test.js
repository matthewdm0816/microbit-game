var req;
// var data;
// var stopped = false;
var threadID;
var canvas, context;
const rectWidth = 5;
const fillStyle = [randomColorString(), randomColorString()];
const agentStyle = [randomColorString(), randomColorString()];
var agentState = [true, true];
const clearStyle = "#FFFFFF";
const agentCount = 2;
var actionId = 0;
var timeInterval = 80;
var directions = ["down", "up"];
var positions = [[100, 100], [10, 10]];
var drawing = false;
// var rectsInd;
const directionWays = {
	"up"   : [0, -1],
	"down" : [0, 1],
	"left" : [-1, 0],
	"right": [1, 0],
};
const directionStrings = [
	"up", "right", "down", "left" // 0, 1, 2, 3
];

function genArray(x, y, generator){
	var p = [];
	for(var i = 0; i < y; i++){
		var q = new Array();
		for(var j = 0; j < x; j++){
			q[j] = generator(i, j);
		}
		p[i] = q;
	}
	return p;
}

var rectsInd = genArray(120, 120, function(x, y){ return -1; });
var lineInd = genArray(120, 120, function(x, y){ return -1; });

function getDirectionString(dirNum){
	return directionStrings[dirNum];
}

function randomColor(){
	return parseInt((Math.random() * 256).toFixed()).toString(16);
}

function randomColorString(){
	return "#" + randomColor() + randomColor() + randomColor();
}

function drawRect(context, x, y, id, isPoint = false, isField = false){
	// x, y ranges from 0 to 119
	if(isPoint){
		context.fillStyle = agentStyle[id];
	}else{
		context.fillStyle = fillStyle[id];
	}
	context.fillRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
	if(isField == false){
		lineInd[y][x] = id;
	}else{
		rectsInd[y][x] = id;
	}
	// rectsInd[y][x] = id;
}

function clearRect(context, x, y){
	// context.fillStyle = clearStyle;
	context.clearRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
	rectsInd[y][x] = -1;
}

function reportDead(id){ // 0, or 1
	// TODO: REPORT DEAD
}

function addPoint(a, b){
	return [a[0] + b[0], a[1] + b[1]];
}

function isValid(a){
	return a[0] >= 0 && a[0] < 120 && a[1] >= 0 && a[1] < 120;
}

function findRects(i, j, id){
	var d = genArray(120, 120, function(x, y){ return -1; });
	var q = [];
	var point;
	var open = false;
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
	q.push([i, j]);
	var points = [];

	while(q.length != 0){
		point = q.pop();
		points.push(point);
		var m = point[0], n = point[1];
		d[m][n] = id;
		for(var k = 0; k < dirs.length; k++){
			var p = addPoint(dirs[k], point);
			var x_ = p[0], y_ = p[1];
			if(isValid(p) == false){ // if reached boundaries
				open = true;
			}
			if(isValid(p)){
				if(d[x_][y_] != id && rectsInd[x_][y_] != id && lineInd[x_][y_] != id){
					q.push(p);
				}
			}
		}
	}

	return {
		"open" : open,
		"points" : points,
	};
}


function fillArea(id){
	var dummyRects = genArray(120, 120, function(x, y){ return -1; });
	for(var i = 0; i < 120; i++){
		for(var j = 0; j < 120; j++){
			if((rectsInd[i][j] == -1) && (lineInd[i][j] == -1) && (dummyRects[i][j] == -1)){
				ret = findRects(i, j, id);
				if(ret.open == false){
					for (var c = ret.points.length - 1; c >= 0; c--) {
						var m = ret.points[c][0], n = ret.points[c][1];
						dummyRects[m][n] = id;
					}
				}else{
					for (var c = ret.points.length - 1; c >= 0; c--) {
						var m = ret.points[c][0], n = ret.points[c][1];
						dummyRects[m][n] = -2;
					}
				}
			}
		}
	}
	for(var i = 0; i < 120; i++){
		for(var j = 0; j < 120; j++){
			if(dummyRects[i][j] == id || lineInd[i][j] == id){
				drawRect(context, j, i, id, false, true);
			}
		}
	}
	lineInd = genArray(120, 120, function(x, y){ return -1; });
}

function updateView(data){
	canvas = document.getElementById("game");
	var dummy_key = -1;
	for(key in data){
		dummy_key = key;
	}
	if(dummy_key != -1){
		console.log(data);
	}
	for(key in data){
		action = data[key];
		if(action.direction != 4){
			directions[action.id - 1] = getDirectionString(action.direction);
			// -1! id: 1 => 0th in position
		}
	}
	for (var i = directions.length - 1; i >= 0; i--) { // iterates through agents
		if(agentState[i] == false){
			continue;
			reportDead(i);
		}
		var directionWay = directionWays[directions[i]];
		drawRect(context, positions[i][0], positions[i][1], i, false);
		// replace last point
		for(var j = 0; j <= 1; j++){ // in 2 directions
			if((positions[i][j] == 0 && directionWay[j] == -1) ||
			 (positions[i][j] == 119 && directionWay[j] == 1)){
			}else{
				positions[i][j] += directionWay[j];
			}
		}
		// drawRect(context, positions[i][0], positions[i][1], i, true);
		// draw current agent
		var x = positions[i][0], y = positions[i][1];
		if(rectsInd[y][x] != i){ // if out of any blocks, switch drawing to true
			drawing = true;
		}
		if(lineInd[y][x] != -1 && lineInd[y][x] != i){ // if encounters oppenents
			agentState[lineInd[y][x]] = false;  // mark opponent DEAD
		}
		if(rectsInd[y][x] == i && drawing == false){ // if inside blocks and not drawing
			continue;
		}
		if(lineInd[y][x] == i){ // if meets itself
			// agentState[lineInd[y][x]] = false; // mark itself DEAD
		}
		if(rectsInd[y][x] == i){ // if meets the blocks of itself
			// TODO: fill area
			drawRect(context, positions[i][0], positions[i][1], i, true);
			fillArea(i);
			drawing = false; // switch to not drawing
		}
		drawRect(context, positions[i][0], positions[i][1], i, true);
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
}

function clearAllRects(){
	rectsInd = genArray(120, 120, function(x, y){ return -1; });
	lineInd = genArray(120, 120, function(x, y){ return -1; });
}

window.onload = function(){
	canvas = document.getElementById("game");
	context = canvas.getContext("2d");

	resetButton = document.getElementById("reset");
	resetButton.addEventListener("click", function(){
		context.clearRect(0, 0, 600, 600);
		clearAllRects();
	});

	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]];
	for (var k = positions.length - 1; k >= 0; k--) {
		for (var i = dirs.length - 1; i >= 0; i--) {
			var tmp = addPoint(positions[k], dirs[i]);
			drawRect(context, tmp[0], tmp[1], k, false, true);
		}
	}
	
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

