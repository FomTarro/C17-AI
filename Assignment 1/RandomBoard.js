var fs = require('fs');

var newBoard = [];

var boardWidth = Math.floor((Math.random() * 7) + 3);
var boardHeight = Math.floor((Math.random() * 7) + 3);

var goalX = Math.floor(Math.random() * boardWidth);
var goalY = Math.floor(Math.random() * boardHeight);
var startX = Math.floor(Math.random() * boardWidth);
var startY = Math.floor(Math.random() * boardHeight);

while(startX == goalX && startY == goalY){
	startX = Math.floor(Math.random() * boardWidth);
	startY = Math.floor(Math.random() * boardHeight);
}

var row = "";

for(var i = 0; i < boardHeight; i++){
	row = "";
	for(var j = 0; j < boardWidth; j++){
		if(j != 0)
			row = row + '\t';
		row = row + Math.floor((Math.random() * 9) + 1).toString();
	}
	newBoard[i] = row;
}

console.log(newBoard);
/*fs.writeFile('random.txt', newBoard, function (err) {
        if (err) throw err;
});*/