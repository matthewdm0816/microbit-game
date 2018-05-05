var req;
// var data;
// var stopped = false;
var threadID;
var canvas, context;
const rectWidth = 5;
const fillStyle = [randomColorString(), randomColorString()];
const agentStyle = [addGray(fillStyle[0]), addGray(fillStyle[1])];
// const agentStyle = [randomColorString(), randomColorString()];
var agentState = [true, true];
const clearStyle = "#FFFFFF";
const agentCount = 2;
var actionId = 0;
var timeInterval = 80;
var directions = ["down", "up"];
var positions = [[30, 30], [10, 10]];
var drawing = true;
var musicCount = 5;
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
var audio, bgm, resetButton;

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

function moreGray(color){
	var clr = parseInt(color, 16);
	clr = Math.min(Math.floor(clr * 0.65), 255);
	return clr.toString(16);
}

function addGray(colorstr){
	var clr = colorstr.slice(1, colorstr.length)
	var r = moreGray(clr.slice(0, 2)), 
		g = moreGray(clr.slice(2, 4)), 
		b = moreGray(clr.slice(4, 6));
	return "#" + r + g + b;
}

function randomColor(){ // a rather light color! (for lines)
	return Math.floor(((Math.random() + 1) * 128)).toString(16);
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
	if(rectsInd[y][x] == id){
		isField == true;
	}
	if(isField == false){
		lineInd[y][x] = id;
	}else{
		// lineInd[y][x] = id;
		rectsInd[y][x] = id;
	}
	// rectsInd[y][x] = id;
}

function clearRect(context, x, y){ // not used ?
	// context.fillStyle = clearStyle;
	context.clearRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
	rectsInd[y][x] = -1;
}

function shuffleMusic(){
	var bgm_music = document.getElementById("bgmMusic")
	bgm_music.src = "/static/paperio/" + Math.ceil(Math.random() * 5)  + ".mp3";
	bgm.load();
}

function reportDead(context, id){ // 0, or 1
	// TODO: REPORT DEAD
	// DISPALY A DEAD MESSAGE
	bgm.pause();
	audio.play();
	audio.onended = function(){
		audio.currentTime = 0;
		agentState = [true, true]; // reinitialize life
		/*positions = [
			[Math.round(Math.random() * 80) + 20, Math.round(Math.random() * 80) + 20],
			[Math.round(Math.random() * 80) + 20, Math.round(Math.random() * 80) + 20]
		]*/
		positions[id] = [Math.round(Math.random() * 80) + 20, Math.round(Math.random() * 80) + 20]; // regenerate positions
		shuffleMusic(); // shuffles music
		bgm.play();
		initRects(id);
	} // revive operations
}

function addPoint(a, b){
	return [a[0] + b[0], a[1] + b[1]];
}

function isValid(a){
	return a[0] >= 0 && a[0] < 120 && a[1] >= 0 && a[1] < 120;
}

function findRects(i, j, id){
	var vis = genArray(120, 120, function(x, y){ return false; });
	var q = [];
	var point;
	var open = false;
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
	q.push([i, j]);
	vis[i][j] = true;
	var points = [];

	while(q.length != 0){
		point = q.pop();
		points.push(point);
		var m = point[0], n = point[1];
		// vis[m][n] = id;
		for(var k = 0; k < dirs.length; k++){
			var p = addPoint(dirs[k], point);
			var x_ = p[0], y_ = p[1];
			if(isValid(p) == false){ // if reaches boundaries
				open = true;
			}
			if(isValid(p)){
				if((vis[x_][y_] == false) && (lineInd[x_][y_] != id) && (rectsInd[x_][y_] != id)){
					q.push(p); // if not visited, not in block or on line
				}
				vis[x_][y_] = true;
			}
		}
	}

	return {
		"open" : open,
		"points" : points,
	};
}


function fillArea(id_){
	// console.log("fillING AREA:" + id_);

	var dummyRects = genArray(120, 120, function(x, y){ return -1; });
	for(var i = 0; i < 120; i++){
		for(var j = 0; j < 120; j++){
			if((lineInd[i][j] == -1) && (dummyRects[i][j] == -1) && (rectsInd[i][j] == -1)){
				ret = findRects(i, j, id_);
				if(ret.open == false){
					for (var c = ret.points.length - 1; c >= 0; c--) {
						var m = ret.points[c][0], n = ret.points[c][1];
						dummyRects[m][n] = id_;
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
			if((dummyRects[i][j] == id_) || (lineInd[i][j] == id_)){
				drawRect(context, j, i, id_, false, true);
				// lineInd[i][j] = -1;
				if(lineInd[i][j] == id_){ // change it to not lined!????
					lineInd[i][j] = -1;
				}
				rectsInd[i][j] = id_;
			}
		}
	}


	/*
	rectsInd = genArray(120, 120, function(x, y){
		if(lineInd[x][y] == id_){
			return id_;
		}else{
			return rectsInd[x][y]
		}
	});
	
	lineInd = genArray(120, 120, function(x, y){ 
		if(lineInd[x][y] == id_){
			rectsInd[x][y] = id_;
			return -1;
		}else{
			return lineInd[x][y];
		}
	});*/
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
			reportDead(context, i);
			continue;
		}
		var directionWay = directionWays[directions[i]];
		drawRect(context, positions[i][0], positions[i][1], i, false);
		// replace last point
		var oldP;
		var nextP = addPoint(positions[i], directionWay);
		oldP = positions[i].map(function(t){return t;});
		if(isValid(nextP)){
			// oldP = positions[i].map(function(t){return t;});
			positions[i] = nextP;
		}
		// drawRect(context, positions[i][0], positions[i][1], i, true);
		// draw current agent
		var x = positions[i][0], y = positions[i][1];
		// lineInd[y][x] == i;
		if(rectsInd[y][x] != i){ // if out of any blocks, switch drawing to true
			drawing = true;
		}
		if((lineInd[y][x] != -1) && (lineInd[y][x] != i)){ // if encounters oppenents
			agentState[lineInd[y][x]] = false;  // mark opponent DEAD
		}
		if((rectsInd[y][x] == i) /*&& (drawing == false)*/){ // if inside blocks and not drawing
			drawRect(context, positions[i][0], positions[i][1], i, true, true);
			continue;
		}
		var nnp = addPoint(positions[i], directionWay);
		if(lineInd[y][x] == i && (isValid(nnp))){ // if meets itself
			agentState[lineInd[y][x]] = false; // mark itself DEAD
		}
		
		if(near(y, x, i, oldP) && isValid(nnp)){ // if meets the blocks of itself, and not heading out
			drawRect(context, positions[i][0], positions[i][1], i, true);
			fillArea(i);
			if(rectsInd[y][x] == i){
				drawing = false; // switch to not drawing
			}
		}
		drawRect(context, positions[i][0], positions[i][1], i, true);
		
	}
}

function cmp(a, b){ return a[0] == b[0] && a[1] == b[1]; }
function swapA(a) {return [a[1], a[0]]; }

function near(i, j, id, oldP){
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
	// var n = false;
	// var rd = exceptDir.map(function(i){ return -i; });
	for (var cl = dirs.length - 1; cl >= 0; cl--) {
		var np = addPoint([i, j], dirs[cl]);
		if(cmp(np, swapA(oldP))){
			// console.log("here closes");
			continue;
		}
		var xx = np[0], yy = np[1];
		if(isValid(np)){
			if(lineInd[xx][yy] == id || rectsInd[xx][yy] == id){
				return true;
			}
		}
	}
	return false;
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

function initRects(idExcept = -1){
	// if(idExcept == -1){ clearAllRects(); }
	
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]];
	for (var k = positions.length - 1; k >= 0; k--) {
		if(k == idExcept){
			continue;
		}
		for (var i = dirs.length - 1; i >= 0; i--) {
			var tmp = addPoint(positions[k], dirs[i]);
			if(isValid(tmp)){
				drawRect(context, tmp[0], tmp[1], k, false, true);
			}
		}
	}
}

function clearAllRects(){
	context.clearRect(0, 0, 600, 600);
	rectsInd = genArray(120, 120, function(x, y){ return -1; });
	lineInd = genArray(120, 120, function(x, y){ return -1; });
}

function startCheck(){
	return setInterval(function(){
		req = new XMLHttpRequest();
		req.open(
			"GET",
			"/paperio/game/check",
			);
		req.onreadystatechange = stateChange;
		req.send(null);
	}, timeInterval);
}

function stopCheck(){
	clearInterval(threadID);
}

window.onload = function(){
	canvas = document.getElementById("game");
	context = canvas.getContext("2d");
	audio = document.getElementById("win");
	audio.pause();
	bgm = document.getElementById("bgm");

	resetButton = document.getElementById("reset");
	resetButton.addEventListener("click", function(){
		// context.clearRect(0, 0, 600, 600);
		initRects();
	});

	bgm.onended = function(){
		shuffleMusic();
		bgm.currentTime = 0;
		bgm.play();
	}

	initRects();
	threadID = startCheck();
};

