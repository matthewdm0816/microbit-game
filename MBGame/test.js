var req;
var data;
window.onload = function(){
	while(true && false){
		req = new XMLHttpRequest();
		req.open(
			"GET",
			"pr/game/check",
			);
		function updateView(){
			var canvas = document.getElementById("game");
			for(key in data){
				console.log(key + ": ");
				console.log(data[key]);
			}
		}

		function stateChange(){
			if(req.readyState == 4){
				if(req.status == 200){
					data = JSON.parse(req.responseText);
					updateView();
				}else{
					alert("Problem retrieving data");
				}
			}
		};
		req.onreadystatechange = stateChange;
		// req.send(null);

	}
};
