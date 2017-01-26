var fs = require('fs');

//stops the program if the board file isn't included
if (process.argv.length !== 3) {
    console.error('Exactly one argument required');
    process.exit(1);
}

var _mapFile = process.argv[2];

// TODO: some sort of persistent node grid stored here;
// ideally a 2d array of x, y coordinates
var _mapStr;
var _map = {};

var _start;
var _goal;

fs.readFile(_mapFile, 'utf-8', function (err, data){
  if (err) throw err;
  _map = data.replace(/[	]/g, '');
  _map = _map.replace(/[\r]/g, '');
  _map = _map.split('\n');
  _mapStr = _map;
  _map = InitBoard(_map);
  PrintBoard(_map);
  EvaluateHeuristic(_map, _goal);
  //!!!!!!!RUN ASTAR IN HERE!!!!!!!!!!!!!!
  AStarPath(_start, _goal);
});

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

/*
a Node needs the folowing properties:

G (intitially infinity)
H (heuristic)
F = (g + h) = cost
parentNode;
*/
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


function EvaluateHeuristic(map, goal){
    for(var i = 0; i < map.length; i++){
        for(var j = 0; j < map[0].length; j++){
            map[i][j].H = Math.abs(i - goal.x) + Math.abs(j - goal.y); 
            map[i][j].ReevaluateF();
        }
    }

}

function PrintPath(path) {
    var printed = path.map(function(cell){
        return (cell.x + " " + cell.y + " (" + cell.G + ")");
    });
    console.log(printed);
}

// generate an Astar path
function AStarPath(start, goal){
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
    PrintPath(plannedPath);
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

    var facingDir = 0;

    while(openSet.length > 0)
    {
        // sort list by lowest f-score
        openSet.sort(
            function (node1, node2) 
            {
                return node1.F - node2.F;
            }
        );

        // investigate lowest f-score first
        var current = openSet[0];
        console.log(current.F);

        if(current == goal)
            return true;

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);
        var neighbors = GetAdjacentCoordinates(current, _map);
        for(var i = 0; i < neighbors.length; i++){
            var neighborNode = neighbors[i];
            
            // check if node with these coordinates exists in the closed set
            // if so, continue
            if(closedSet.includes(neighborNode))
                continue;
            if(neighborNode.eval == "neighbor"){
                var gTemp = current.G + parseInt(neighborNode.complexity);
            } // factor in the additional cost of leaping
            else if(neighborNode.eval == "leap"){
                 var gTemp = current.G + 20;
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
    return false;
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
             && !(x == 0 && y == 0)){
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