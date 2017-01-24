<<<<<<< HEAD
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

fs.readFile(_mapFile, 'utf-8', function (err, data){
  if (err) throw err;
  _map = data.replace(/[	]/g, '');
  _map = _map.replace(/[\r]/g, '');
  _map = _map.split('\n');
  _mapStr = _map;
  _map = InitBoard(_map);
  //PrintBoard(_map)
  //console.log(_map[2][3]);
  //!!!!!!!RUN ASTAR IN HERE!!!!!!!!!!!!!!
  AStarPath(_map[2][2], _map[0][1]);
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
=======
>>>>>>> 560e6d3431c6082e8cdf8892e5dece167604fa69
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

// generate an Astar path
function AStarPath(start, goal){
    var success = Search(start, goal);
    console.log(success);
    var plannedPath = [];
    if(success){
        var node = goal;
        plannedPath.add(node);
        node = node.parentNode;
    }

    plannedPath.reverse();
    for(var i = 0; i < plannedPath.length; i++) {
        console.log(plannedPath[i]);
    }
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
        console.log(_openSet.length);
        // sort list by lowest f-score
        openSet.sort(
            function (node1, node2) 
            {
                return node1.F - node2.F;
            }
        );
        // investigate lowest f-score first
        var current = openSet[0];

        if(current == goal)
        {
            // exit this function which triggers path construction
            return true;
        }

        openSet.splice(_openSet.indexOf(current), 1);
        closedSet.push(current);

        var neighbors = GetAdjacentCoordinates(current, _map);
        for(var i = 0; i < neighbors.length; i++){
            var neighborNode = neighbors[i];

            // TODO: factor in turning costs
            if(neighbors[neighborNode] == "neighbor"){
        
            } // factor in the additional cost of leaping
            else if(neighbors[neighborNode] == "leap"){
                
            }
            // check if node with these coordinates exists in the closed set
            // if so, continue

            // update the G value
            var gTemp = current.G + 1;

            if(!openSet.includes(neighborNode)) // discover a new node
            {
                openSet.push(neighborNode);
            }
            else if(gTemp >= neighborNode.G) // this is not a better path
            {
                continue;
            }

            // this is the best path until now, so record itself
            neighborNode.parentNode = current;
            neighborNode.G = gTemp;
        }
    }
    return false;
}

// Pass in a node and the extremes of the map, gets all valid adjacent coordinates. 
// Assumes minimum bounds are zero. 
function GetAdjacentCoordinates(node, map){
    var maxWidth = map[0].length;
    var maxHeight = map.length;
    var nodeList = [];
    for(var x = -1; x <= 1; x+=2)
    {
         for(var y = -1; y <= 1; y+=2)
         {
             var xCoord = (node.x + x);
             var xLeapCoord = (node.x + (3*x));
             var yCoord = (node.y + y);
             var yLeapCoord = (node.y + (3 *y));

             var neighbor;
             // if the new coordinates are within map bounds, and not equal to the node itself
             if((xCoord <= maxWidth && xCoord >= 0) && (yCoord <= maxHeight && yCoord > 0) 
             && !(x == 0 && y == 0)){
                 neighbor = map[x][y];
                 nodeList[coord] = "neighbor";
             }
             else if((xLeapCoord <= maxWidth && xLeapCoord >= 0) && (yLeapCoord <= maxHeight && yLeapCoord > 0) 
             && !(x == 0 && y == 0)){
                 neighbor = map[x][y];
                 nodeList[coord] = "leap";
             }
         }
    }
    return nodeList;
}

function EvaluateHeuristic(node, goal){

}