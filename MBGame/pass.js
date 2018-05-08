var req; // global XMLHttpRequest object, for polls to update view
// var data;
// var stopped = false;
var threadID; // ID of intervalss
var canvas, context; 
const rectWidth = 5; // rectangle width: 5px

// color OPTION 0
// const fillStyle = [randomColorString(), randomColorString()]; // randomized color of blocks
// const lineStyle = [addGray(fillStyle[0]), addGray(fillStyle[1])];
// const agentStyle = [addGray(lineStyle[0]), addGray(lineStyle[1])];

// color OPTION 1
// const fillStyle = [randomColorString(), randomColorString()];
// const agentStyle = [addGray(fillStyle[0]), addGray(fillStyle[1])];
// const lineStyle = [addGray(agentStyle[0]), addGray(agentStyle[1])];

// color OPTION 2
// const fillStyle = [randomColorString(), randomColorString()];
// const lineStyle = [randomColorString(), randomColorString()];
// const agentStyle = [randomColorString(), randomColorString()];

// color OPTION 3
const lineStyle = [randomColorString(), randomColorString()];
const fillStyle = [addGray(lineStyle[0]), addGray(lineStyle[1])];
const agentStyle = [addGray(fillStyle[0]), addGray(fillStyle[1])];

var agentState = [true, true]; // agent living style
const clearStyle = "#FFFFFF"; 
const agentCount = agentState.length;
var actionId = 0;
var timeInterval = 80; // refresh interval
var directions = ["down", "up"]; // initial directions
// var positions = [[30, 30], [10, 10]]; // initial postions
var positions = [[80, 80], [60, 60]]; // initial postions
var drawing = [false, false]; // initial drawing state(?)
var musicCount = 5; // track amount
const totalBlocks = 120 * 120;

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
var rectsInd = genArray(120, 120, function(x, y){ return -1; }); // inidicate painted blocks
var lineInd = genArray(120, 120, function(x, y){ return -1; }); // indicate line blocks

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
		for(var i = 0; i < positions.length; i++){
			initRects(i);
		}
	});

	// 老板, 换碟!
	bgm.addEventListener("ended", function(){
		shuffleMusic();
		bgm.currentTime = 0;
		bgm.play();
	});

	for(var i = 0; i < positions.length; i++){
		initRects(i);
	}

	// start polling
	threadID = startCheck();
};

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
	return Math.floor(((Math.random() + 1) * 96)).toString(16);
}

// generate full color string
function randomColorString(){
	return "#" + randomColor() + randomColor() + randomColor();
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

// compare points
function cmp(a, b){ return a[0] == b[0] && a[1] == b[1]; }

// swap x and y of a point
function swapA(a) {return [a[1], a[0]]; }

// 老板, 换碟!
function shuffleMusic(){
	var bgm_music = document.getElementById("bgmMusic")
	bgm_music.src = "/static/paperio/" + Math.ceil(Math.random() * 5)  + ".mp3";
	bgm.load();
}

function drawRect(x, y, color){
	// x, y ranges from 0 to 119
	context.fillStyle = color;
	context.fillRect(x * rectWidth, y * rectWidth, rectWidth, rectWidth);
}

function clearAll(){
	context.clearRect(0, 0, 600, 600);
}

// update canvas according to lineInd and rectInd
function updateCanvas(){
	clearAll();
	for(var m = 0; m < 120; m++){
		for(var n = 0; n < 120; n++){
			if(lineInd[m][n] == -1 && rectsInd[m][n] == -1){
				// drawRect(n, m, clearStyle);
			}else if(lineInd[m][n] != -1){
				drawRect(n, m, lineStyle[lineInd[m][n]]);
			}else if(rectsInd[m][n] != -1){
				drawRect(n, m, fillStyle[rectsInd[m][n]]);
			}else{
				console.log("what heck!");
			}
		}
	}
	for (var m = 0; m < positions.length; m++) {
		drawRect(positions[m][0], positions[m][1], agentStyle[m]);
	}
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
		var $x = point[0], $y = point[1];
		if(lineInd[$x][$y] == id || rectsInd[$x][$y] == id){ // NOTE:WHETHER INCLUDE RECT BOUND?
			continue; // if reached line or block, skip and don't explore on
		}
		vis[$x][$y] = true;
		for(var k = 0; k < dirs.length; k++){
			var p = addPoint(dirs[k], point);
			var x_ = p[0], y_ = p[1];
			if(isValid(p) == false){ // if reaches boundaries
				open = true;
			}
			if(isValid(p)){
				if(vis[x_][y_] == false){
					q.push(p); // if not visited, explore
				}
				// vis[x_][y_] = true;
			}
		}
	}

	return {
		"open" : open,
		"points" : points, // includes line pixels.
	};
}

// fill all closed areas
function fillArea(id_){
	// console.log("fillING AREA:" + id_);
	var any_closed = false;
	var dummyRects = genArray(120, 120, function(x, y){ return -1; });
	for(var i = 0; i < 120; i++){
		for(var j = 0; j < 120; j++){
			if((lineInd[i][j] != id_) && (dummyRects[i][j] == -1) && (rectsInd[i][j] != id_)){
				ret = findRects(i, j, id_);
				if(ret.open == false){
					any_closed = true;
					for (var c = ret.points.length - 1; c >= 0; c--) {
						var m = ret.points[c][0], n = ret.points[c][1];
						dummyRects[m][n] = id_; // set color to id_

					}
				}else{
					for (var c = ret.points.length - 1; c >= 0; c--) {
						var m = ret.points[c][0], n = ret.points[c][1];
						dummyRects[m][n] = -2; // set color to -2: visited, but not closed
					}
				}
			}
		}
	}
	
	var rectsCount = 0;
	for(var i = 0; i < 120; i++){ 
		for(var j = 0; j < 120; j++){
			if((dummyRects[i][j] == id_)){
				// drawRect(context, j, i, id_, false, true);
				// lineInd[i][j] = -1;
				// if(lineInd[i][j] == id_){ // change it to not lined!????
				lineInd[i][j] = -1;
				//}
				rectsInd[i][j] = id_;
			}
			if(lineInd[i][j] == id_ && (any_closed /*|| near(i, j, id_)*/)){
				lineInd[i][j] = -1;
				rectsInd[i][j] = id_;
			}
			if(rectsInd[i][j] == id_){
				rectsCount += 1;
			}
		}
	}

	if(rectsCount / totalBlocks >= 0.95){
		displayEgg();
	}
	updateCanvas();
}

function fillLine(id){
	// console.log("fillLine called on id " + id);
	for(var i = 0; i < 120; i++){ 
		for(var j = 0; j < 120; j++){
			if(lineInd[i][j] == id){
				lineInd[i][j] = -1;
				rectsInd[i][j] = id;
			}
		}
	}
	updateCanvas();
}

function updateView(data){
	// obtain canvas object, actually of no use
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
			reportDead(i);
			continue;
		}
		var directionWay = directionWays[directions[i]];
		var oldP; // prev point
		var nextP = addPoint(positions[i], directionWay); // next point
		oldP = positions[i].map(function(t){return t;}); // record previous point
		var last_in_rects = (rectsInd[oldP[1]][oldP[0]] == i);
		if(isValid(nextP)){
			// oldP = positions[i].map(function(t){return t;});
			positions[i] = nextP;
		}else{ // if hits edge, agent will die 
			// agentState[i] = false; 
		}
		var x = positions[i][0], y = positions[i][1];

		if(lineInd[y][x] != i && lineInd[y][x] != -1){ // if not empty and not itself
			agentState[lineInd[y][x]] = false;
		}

		if(rectsInd[y][x] == i){ // if inside painted area 
			if(last_in_rects == false){
				fillLine(i);
				// console.log("here");
			}
			// updateCanvas();
			continue; // do nothing;
		}else{
			lineInd[y][x] = i;
			fillArea(i);
			// updateCanvas();
		}

		
	}
}

function reportDead(id){ // 0, or 1
	// TODO: REPORT DEAD
	// DISPALY A DEAD MESSAGE
	bgm.pause();
	audio.play();
	positions[id] = [Math.round(Math.random() * 80) + 20, Math.round(Math.random() * 80) + 20]; // regenerate positions
	initRects(id); // NOTE: TO BE MODIFIED
	agentState[id] = true;
	audio.onended = function(){
		audio.currentTime = 0;
		// agentState = [true, true]; // reinitialize life
		/*positions = [
			[Math.round(Math.random() * 80) + 20, Math.round(Math.random() * 80) + 20],
			[Math.round(Math.random() * 80) + 20, Math.round(Math.random() * 80) + 20]
		]*/
		shuffleMusic(); // shuffles music
		bgm.play();
		audio.onended = function(){};
	} // revive operations
}

// init rectangle for ONE player
function initRects(id){ 
	for(var p = 0; p < 120; p++){
		for(var q = 0; q < 120; q++){
			if(lineInd[p][q] == id){
				lineInd[p][q] = -1;
			}
			if(rectsInd[p][q] == id){
				rectsInd[p][q] = -1;
			}
		}
	}

	// draw initial pixels
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]];
	// drawing[k] = false;
	for (var i = dirs.length - 1; i >= 0; i--) {
		var tmp = addPoint(positions[id], dirs[i]);
		if(isValid(tmp)){
			rectsInd[tmp[1]][tmp[0]] = id;
		}
	}
	updateCanvas();
}

// check if near any line/block
function near(i, j, id){
	var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
	// var n = false;
	// var rd = exceptDir.map(function(i){ return -i; });
	for (var cl = dirs.length - 1; cl >= 0; cl--) {
		var np = addPoint([i, j], dirs[cl]);
		var xx = np[0], yy = np[1];
		if(isValid(np)){
			if(rectsInd[xx][yy] == id){
				return true;
			}
		}
	}
	return false;
}


function displayEgg(){
	
}	


