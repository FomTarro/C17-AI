var fs = require('fs');
var Heuristic = require('./heuristics')();

//stops the program if the board file isn't included
if (process.argv.length !== 4) {
    console.error('Exactly two arguments required');
    console.error('node AStar.js <boardfile>.txt <heuristic to use>');
    process.exit(1);
}

//generates a random board in random.txt is the passed in argument is 'random' this also exits the program
if(process.argv[2] == 'random'){
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
			if(i == goalY && j == goalX)
				row = row + 'G';
			else if(i == startY && j == startX)
				row = row + 'S';
			else{
				if(Math.random() <= .1)
					row = row + '#';	
				else
					row = row + Math.floor((Math.random() * 9) + 1).toString();	
			}
		}
		if(i == boardHeight - 1)
			newBoard[i] = row;
		else
			newBoard[i] = row + '\r' + '\n';
	}
	
	console.log('Preview:');
	var preview = newBoard.toString().replace(/[	]/g, '');
	preview = preview.replace(/[\r]/g, '');
	preview = preview.split('\n');
	preview.forEach(function(d) {
	    	console.log('[' + d.replace(/[,]/g,'') + ']');
	});
	fs.writeFile('random.txt', newBoard.toString().replace(/[,]/g,''), function (err) {
	        if (err) throw err;
            else {
                PerformAStar();
            }
	});
	console.log('new board created in random.txt');
} else {
    PerformAStar();
}

function PerformAStar() {
    var _mapFile = process.argv[2];
    var _heuristicValue = process.argv[3];

    // TODO: some sort of persistent node grid stored here;
    // ideally a 2d array of x, y coordinates
    var _mapStr;
    var _map = {};

    //array of strings representing the list of actions took to reach the goal
    var actionLog = [];
    //the current action step
    var actionStep = 0;

    var nodesExpanded = 0;

    var robotX;
    var robotY;
    var robotDir = 0;//(0 = north, 1 = west, 2 = south, 3 = east)

    var _start;
    var _goal;

    fs.readFile(_mapFile, 'utf-8', function (err, data){
    if (err) throw err;
    _map = data.replace(/[	]/g, '');
    _map = _map.replace(/[\r]/g, '');
    _map = _map.split('\n');
    _mapStr = _map;
    
    _map.forEach(function(d) {
        console.log(d.split(''));
    });
    
    _map = InitBoard(_map);
    //PrintBoard(_map);
    EvaluateHeuristic(_map, _goal, _heuristicValue);
    //!!!!!!!RUN ASTAR IN HERE!!!!!!!!!!!!!!
    AStarPath(_start, _goal);
    if((500 - _goal.G) > 0)
        console.log('Score: ' + (500 - _goal.G));
    else
        console.log('Score: 0');
        
    console.log('Actions taken: ' + actionLog.length);
    
    console.log('Number of Nodes Expanded: ' + nodesExpanded);
    
    PrintActionLog();
    });

    //record the action the robot took to the actionLog
    function LogAction(actionTook){
        actionLog[actionStep] = actionTook;
        actionStep++;
    }

    function PrintActionLog(){
        console.log('Actions: ')
        actionLog.forEach(function(d) {
            console.log(d);
        });
    }

    function PrintBoard(board){
        var printed = board.map(function(row) {
            return row.map(function(cell) {
                return cell.complexity;
            })
        });
        console.log(printed);
    }

    //Add cells to board
    function InitBoard(oldBoard) {
        var newBoard = [];
        oldBoard.forEach(function(d, rowNum) {
            newBoard[rowNum] = [];
            for(var colNum = 0; colNum < d.length; colNum++) {
                var val = d.charAt(colNum);
                newBoard[rowNum][colNum] = new Cell(rowNum, colNum, val);
                if(newBoard[rowNum][colNum].complexity == 'G'){
                    _goal = newBoard[rowNum][colNum];
                    _goal.complexity = '1';
                }
                else if(newBoard[rowNum][colNum].complexity == 'S'){
                    _start = newBoard[rowNum][colNum];
                    _start.complexity = '1';
                }
            }
        });
        return newBoard;
    }


    function Cell(x, y, complexity) {
        this.x = x;
        this.y = y;

        // For each node, the cost of getting from the start node to that node.
        this.G = Number.MAX_VALUE;

        // Heuristic value
        this.H = 0;

        // For each node, the total cost of getting from the start node to the goal
        this.F = this.G + this.H;

        this.parentNode = undefined;
        this.eval = "";

        this.ReevaluateF = function(){
            this.F = this.G + this.H;
        };

        //Check if complexity is valid
        if(complexity == typeof(string)) {
            if(complexity != '#' || complexity != 'G' || complexity != 'S') {
                complexity = parseInt(complexity);
            }
        }
        if(complexity < 1 || complexity > 9) {
            throw new Error("Cell_constructor: Invalid cell complexity " + complexity);
            process.exit(1);
        }
        else {
            this.complexity = complexity;
        }

        return this;
    }


    function EvaluateHeuristic(map, goal, heuristic){
        console.log("Evaluating heuristic: " + heuristic);
        for(var i = 0; i < map.length; i++){
            for(var j = 0; j < map[0].length; j++){
                var horizontal = Heuristic.findAbsDistanceOfX(i, goal.x);
                var vertical = Heuristic.findAbsDistanceOfY(j, goal.y);
                switch(parseInt(heuristic)) {
                    case 1:
                        // start with base heuristic of 0
                        map[i][j].H = 0;
                        break;
                    case 2:
                        // find the min heuristic
                        map[i][j].H = Heuristic.Min(vertical, horizontal);
                        break;
                    case 3:
                        // same for the max heuristic
                        map[i][j].H = Heuristic.Max(vertical, horizontal);
                        break;
                    case 4:
                        // find the "manhattan" heuristic
                        //map[i][j].H = Math.abs(i - goal.x) + Math.abs(j - goal.y); 
                        map[i][j].H = Heuristic.Manhattan(vertical, horizontal);
                        break;
                    case 5:
                        // find the true goal cost as of the current unit of time spent and store it as a heuristic
		                // (this is an admissable heuristic)
                        map[i][j].H = Heuristic.Manhattan(vertical, horizontal) / 1;
                        break;
                    case 6:
                        // find a non-admissable heuristic
                        map[i][j].H = Heuristic.Manhattan(vertical, horizontal) * 3;
                        break;
                }
                //console.log("Cell Heuristic: " + map[i][j].H);
                map[i][j].ReevaluateF();
            }
        }

    }

    function PrintPath(path) {
        var printed = path.map(function(cell){
            return (cell.x + ", " + cell.y + " (Cost: " + cell.G + ")");
        });
        console.log(printed);
    }

    // generate an Astar path
    function AStarPath(start, goal){
        console.log("Starting at [" + start.x + ", " + start.y+"]")
        
        robotX = start.x;
        robotY = start.y;
        
        var success = Search(start, goal);
        var plannedPath = [];
        if(success){
            var node = goal;
            while(node != start) {
                plannedPath.push(node);
                node = node.parentNode;
            }
        }

        plannedPath.reverse();
        plannedPath.forEach(function(d){
            switch(robotDir){
                case 1:
                    if(d.y == robotY - 1)
                        LogAction('forward');
                    else if(d.y == robotY + 1){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('forward');
                    }
                    else if(d.y == robotY + 3){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('leap');
                    }
                    else if(d.y == robotY - 3)
                        LogAction('leap');
                    else if(d.x < robotX){
                        LogAction('turn right');
                        if(d.x == robotX - 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 0;
                    }
                    else{
                        LogAction('turn left');
                        if(d.x == robotX + 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 2;
                    }
                    break;
                case 0:
                    if(d.x == robotX - 1)
                        LogAction('forward');
                    else if(d.x == robotX + 1){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('forward');
                    }
                    else if(d.x == robotX + 3){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('leap');
                    }
                    else if(d.x == robotX - 3)
                        LogAction('leap');
                    else if(d.y < robotY){
                        LogAction('turn left');
                        if(d.y == robotY - 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 1;
                    }
                    else{
                        LogAction('turn right');
                        if(d.y == robotY + 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 3;
                    }
                    break;
                case 3:
                    if(d.y == robotY + 1)
                        LogAction('forward');
                    else if(d.y == robotY - 1){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('forward');
                    }
                    else if(d.y == robotY - 3){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('leap');
                    }
                    else if(d.y == robotY + 3)
                        LogAction('leap');
                    else if(d.x < robotX){
                        LogAction('turn left');
                        if(d.x == robotX - 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 0;
                    }
                    else{
                        LogAction('turn right');
                        if(d.x == robotX + 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 2;
                    }
                    break;
                case 2:
                    if(d.x == robotX + 1)
                        LogAction('forward');
                    else if(d.x == robotX - 1){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('forward');
                    }
                    else if(d.x == robotX - 3){
                        LogAction('turn 180');//REPLACE ONCE TURNING IS DONE
                        LogAction('leap');
                    }
                    else if(d.x == robotX + 3)
                        LogAction('leap');
                    else if(d.y < robotY){
                        LogAction('turn right');
                        if(d.y == robotY - 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 1;
                    }
                    else{
                        LogAction('turn left');
                        if(d.y == robotY + 1)
                            LogAction('forward');
                        else
                            LogAction('leap');
                        robotDir = 3;
                    }
                    break;
            }
            robotX = d.x;
            robotY = d.y;
        });
        PrintPath(plannedPath);
        console.log("Ending at at [" + goal.x + ", " + goal.y+"]")
        console.log("Total cost: " + goal.G);
        return plannedPath;
    }

    // Do the Astar search
    function Search(start, goal)
    {
        // Already evaluated nodes go here
        var closedSet = [];
        // Currently discovered nodes that are also evaluated
        var openSet = [start];

        start.G = 0;

        var facingDir = "North"

        while(openSet.length > 0)
        {
            // sort list by lowest f-score
            openSet.sort(function (node1, node2) {return node1.F - node2.F;});

            // investigate lowest f-score first
            var current = openSet[0];
            //console.log(current.F);

            if(current == goal)
            {
                // goal was found, exit the function
                return true;
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.push(current);
            nodesExpanded++;

            var neighbors = GetAdjacentCoordinates(current, _map);
            for(var i = 0; i < neighbors.length; i++)
            {
                var neighborNode = neighbors[i];
                
                // check if node with these coordinates exists in the closed set
                // if so, continue
                if(closedSet.includes(neighborNode))
                    continue;

                // turning check here!
                var turnCost = 0;
                if(current.parentNode != undefined && (GetHeading(current.parentNode, current) != GetHeading(current, neighborNode)))
                {
                    turnCost = CalculateTurnCost(current);
                }
                if(neighborNode.eval == "neighbor"){
                    var gTemp = current.G + turnCost + parseInt(neighborNode.complexity);
                } // factor in the additional cost of leaping
                else if(neighborNode.eval == "leap"){
                    var gTemp = current.G + turnCost + 20;
                }

                if(!openSet.includes(neighborNode)) // discover a new node
                    openSet.push(neighborNode);
                else if(gTemp >= neighborNode.G) // this is not a better path
                    continue;

                // this is the best path until now, so record itself

                

                neighborNode.parentNode = current;
                neighborNode.G = gTemp;
                neighborNode.ReevaluateF();
            }
        }

        // no path could be found
        return false;
    }

    function CalculateTurnCost(node)
    {
        return Math.ceil(node.complexity/3);
    }

    function GetHeading(from, to){
        var heading;
        if(from.x - to.x < 0){
            heading = "East";
        }
        else if(from.x - to.x > 0){
            heading = "West";
        }
        else if(from.y - to.y < 0){
            heading = "North";
        }
        else if(from.y - to.y > 0){
            heading = "South";
        }
        return heading;
    }

    // Pass in a node and the extremes of the map, gets all valid adjacent coordinates. 
    // Assumes minimum bounds are zero. 
    function GetAdjacentCoordinates(node, map){
        var maxWidth = map.length;
        var maxHeight = map[0].length;
        var nodeList = [];
        for(var x = -1; x <= 1; x++)
        {
            for(var y = -1; y <= 1; y++)
            {
                var xCoord = (node.x + x);
                var xLeapCoord = (node.x + (3*x));

                var yCoord = (node.y + y);
                var yLeapCoord = (node.y + (3*y));

                var neighbor;
                // if the new coordinates are within map bounds, and not equal to the node itself
                if((xCoord < maxWidth && xCoord >= 0) && (yCoord < maxHeight && yCoord >= 0) 
                && !(x == 0 && y == 0) && ((Math.abs(x) + Math.abs(y)) != 2)){
                    neighbor = map[xCoord][yCoord];
                    neighbor.eval = "neighbor";
                    if(neighbor.complexity != "#")
                    {
                        nodeList.push(neighbor);
                    }
                }
                if((xLeapCoord < maxWidth && xLeapCoord >= 0) && (yLeapCoord < maxHeight && yLeapCoord > 0) 
                && !(x == 0 && y == 0) && ((Math.abs(x) + Math.abs(y)) != 2)){
                    neighbor = map[xLeapCoord][yLeapCoord];
                    neighbor.eval = "leap";
                    if(neighbor.complexity != "#")
                    {
                        nodeList.push(neighbor);
                    }
                }
            }  
        }
        return nodeList;
    }
}