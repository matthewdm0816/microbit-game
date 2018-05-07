var req; // global XMLHttpRequest object, for polls to update view
// var data;
// var stopped = false;
var threadID; // ID of intervalss
var canvas, context; 
const rectWidth = 5; // rectangle width: 5px
const fillStyle = [randomColorString(), randomColorString()]; // randomized color of blocks
const agentStyle = [addGray(fillStyle[0]), addGray(fillStyle[1])];
// const agentStyle = [randomColorString(), randomColorString()];
var agentState = [true, true]; // agent living style
const clearStyle = "#FFFFFF"; 
const agentCount = agentState.length;
var actionId = 0;
var timeInterval = 80;
var directions = ["down", "up"]; // initial directions
// var positions = [[30, 30], [10, 10]]; // initial postions
var positions = [[80, 80], [60, 60]]; // initial postions
var drawing = [false, false]; // initial drawing state(?)
var musicCount = 5; // track amount
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
var audio, bgm, resetButton; // corresponding DOM elements

// generate array according to generator
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

var rectsInd = genArray(120, 120, function(x, y){ return -1; }); // inidicate painted blocks
var lineInd = genArray(120, 120, function(x, y){ return -1; }); // indicate line blocks

function getDirectionString(dirNum){
	return directionStrings[dirNum];
}

// add more gray to color(one channel)
function moreGray(color){
	var clr = parseInt(color, 16);
	clr = Math.min(Math.floor(clr * 0.65), 255);
	return clr.toString(16);
}

// add more gray to color(3 channels)
function addGray(colorstr){
	var clr = colorstr.slice(1, colorstr.length)
	var r = moreGray(clr.slice(0, 2)), 
		g = moreGray(clr.slice(2, 4)), 
		b = moreGray(clr.slice(4, 6));
	return "#" + r + g + b;
}

// generate a rather light color, for lines and blocks
function randomColor(){ 
	return Math.floor(((Math.random() + 1) * 128)).toString(16);
}

// generate full color string
function randomColorString(){
	return "#" + randomColor() + randomColor() + randomColor();
}

// draw rectangle(pixel) at given position
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

// clear rectangle at given pos
function clearRect(context, x, y){ // not used ?
	// context.fillStyle = clearStyle;
	context.clearRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
	rectsInd[y][x] = -1;
	lineInd[y][x] = -1;
}

// 老板, 换碟!
function shuffleMusic(){
	var bgm_music = document.getElementById("bgmMusic")
	bgm_music.src = "/static/paperio/" + Math.ceil(Math.random() * 5)  + ".mp3";
	bgm.load();
}

// called when dead, plays a short music and restart
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
		initRects(1-id); // NOTE: TO BE MODIFIED
	} // revive operations
}

// point addition
function addPoint(a, b){
	return [a[0] + b[0], a[1] + b[1]];
}

// check point validity(in canvas)
function isValid(a){
	return a[0] >= 0 && a[0] < 120 && a[1] >= 0 && a[1] < 120;
}

// find all near blocks using DFS, and decide if the area is open(connected to boundary)
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

// fill all closed areas
function fillArea(id_){
	// console.log("fillING AREA:" + id_);

	var dummyRects = genArray(120, 120, function(x, y){ return -1; });
	for(var i = 0; i < 120; i++){
		for(var j = 0; j < 120; j++){
			if((lineInd[i][j] != id_) && (dummyRects[i][j] == -1) && (rectsInd[i][j] != id_)){
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
			// rectsInd[x][y] = id_;
			return -1;
		}else{
			return lineInd[x][y];
		}
	});*/
}

// read data and update canvas
function updateView(data){
	// obtain canvas object
	canvas = document.getElementById("game");

	// check whether data is empty
	var dummy_key = -1;
	for(key in data){
		dummy_key = key;
	}
	if(dummy_key != -1){
		console.log(data);
	}

	// change direction
	for(key in data){
		action = data[key];
		if(action.direction != 4){
			directions[action.id - 1] = getDirectionString(action.direction);
			// -1! id: 1 => 0th in position
		}
	}

	// move forward for each agent
	for (var i = directions.length - 1; i >= 0; i--) { // iterates through agents

		// if dead
		if(agentState[i] == false){
			reportDead(context, i);
			continue;
		}

		var directionWay = directionWays[directions[i]];
		// replace previous point by normal style
		drawRect(context, positions[i][0], positions[i][1], i, false); 

		var oldP; // prev point
		var nextP = addPoint(positions[i], directionWay); // next point
		oldP = positions[i].map(function(t){return t;}); // copy previous point
		if(isValid(nextP)){
			// oldP = positions[i].map(function(t){return t;});
			positions[i] = nextP;
		}else{ // if hits edge, agent will die 
			agentState[i] = false; 
		}
		// drawRect(context, positions[i][0], positions[i][1], i, true);
		// draw current agent
		var x = positions[i][0], y = positions[i][1];
		// lineInd[y][x] == i;
		if(rectsInd[y][x] != i){ // if out of any blocks, switch drawing to true
			drawing[i] = true;
		}else{
			drawing[i] = false;
		}

		if((lineInd[y][x] != -1) && (lineInd[y][x] != i)){ // if encounters oppenents
			agentState[lineInd[y][x]] = false;  // mark opponent DEAD
		}

		if((rectsInd[y][x] == i) && (drawing[i] == false)){ // if inside blocks and not drawing
			drawRect(context, positions[i][0], positions[i][1], i, true, true);
			continue;
		}

		var nnp = addPoint(positions[i], directionWay);
		if(lineInd[y][x] == i && (isValid(nnp))){ // if meets itself, thus go backward
			agentState[lineInd[y][x]] = false; // mark itself DEAD
		}

		if(inBlock(y, x, i)){
			drawing[i] = false;
			fillArea(i);
		}else{
			if(near(y, x, i, oldP) && isValid(nnp)){ // if meets the blocks of itself, and not heading out
				drawRect(context, positions[i][0], positions[i][1], i, true); // draw agent style point
				fillArea(i); // fill all closed areas
				if(rectsInd[y][x] == i){
					drawing[i] = false; // switch to not drawing
				}
			}else{
				drawRect(context, positions[i][0], positions[i][1], i, true, drawing);
			}
		// drawRect(context, positions[i][0], positions[i][1], i, true);
		}

		if(rectsInd[y][x] != i){ // if out of any blocks, switch drawing to true
			drawing[i] = true;
		}else{
			drawing[i] = false;
		}
	}
}

function inBlock(x, y, id){
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]];
	var count = 0;
	for(var k = 0; k < dirs.length; k++){
		if(lineInd[x][y] == id || rectsInd[x][y] == id){
			count += 1;
		}
	}
	if(count >= 3){
		return true;
	}else{
		return false;
	}
}

// compare points
function cmp(a, b){ return a[0] == b[0] && a[1] == b[1]; }

// swap x and y of a point
function swapA(a) {return [a[1], a[0]]; }

// check if near any line/block
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

// called when state changes
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

// init rectangle except for ONE player
function initRects(idExcept = -1){ // idExcept -- winner, if -1, then clear all
	// if(idExcept == -1){ clearAllRects(); }
	for(var p = 0; p < 120; p++){
		for(var q = 0; q < 120; q++){
			if(idExcept == -1){
				clearRect(context, q, p); // NEED TEST
				continue;
			}
			if(lineInd[p][q] == idExcept || rectsInd[p][q] == idExcept){
				// clearRect(context, q, p);
			}else{
				clearRect(context, q, p);
			}
		}
	}

	// draw initial pixels
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]];
	for (var k = positions.length - 1; k >= 0; k--) {
		if(k == idExcept){
			continue;
		}
		drawing[k] = false;
		for (var i = dirs.length - 1; i >= 0; i--) {
			var tmp = addPoint(positions[k], dirs[i]);
			if(isValid(tmp)){
				drawRect(context, tmp[0], tmp[1], k, false, true);
			}
		}
	}
}

// clear all retangles plotting history
function clearAllRects(){
	context.clearRect(0, 0, 600, 600);
	rectsInd = genArray(120, 120, function(x, y){ return -1; });
	lineInd = genArray(120, 120, function(x, y){ return -1; });
}

// start polling
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

// stop polling
function stopCheck(){
	clearInterval(threadID);
}

// on window loaded
window.onload = function(){
	// obtain DOM elements
	canvas = document.getElementById("game");
	context = canvas.getContext("2d");
	audio = document.getElementById("win");
	audio.pause();
	bgm = document.getElementById("bgm");
	bgm.play();

	// attach reset to reset button
	resetButton = document.getElementById("reset");
	resetButton.addEventListener("click", function(){
		// context.clearRect(0, 0, 600, 600);
		initRects();
	});

	// 老板, 换碟!
	bgm.onended = function(){
		shuffleMusic();
		bgm.currentTime = 0;
		bgm.play();
	}

	// initialize all rectangles
	initRects();

	// start polling
	threadID = startCheck();
};

