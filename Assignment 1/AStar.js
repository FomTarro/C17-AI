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
function Cell(x, y, complexity) {
    this.x = x;
    this.y = y;
    this.G = Number.MAX_VALUE;
    this.H = 0;
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
    var _closedSet = [];
    // Currently discovered nodes that are also evaluated
    var _openSet = [start];

    start.G = 0;

    while(_openSet.length > 0)
    {
        console.log(_openSet.length);
        // sort list by lowest f-score
        _openSet.sort(
            function (node1, node2) 
            {
                return node1.F - node2.F;
            }
        );

        // investigate lowest f-score first
        var current = _openSet[0];

        if(current == goal)
        {
            // construct a path and exit this function
            return true;
        }
        _openSet.splice(_openSet.indexOf(current), 1);
        _closedSet.push(current);

        var neighbors = GetAdjacentCoordinates(current, _map[0].length, _map.length);
        for(var i = 0; i < neighbors.length; i++){
            var neighborNode; // set this to neighbors[i].x, neighbors[i].y from the map structure

            // check if node with these coordinates exists in the closed set
            // if so, continue

            // assumes cost between each tile is just 1
            // this would be where to insert heuristics
            var gTemp = current.G + 1;

            if(!_openSet.includes(neighborNode)) // discover a new node
            {
                _openSet.push(neighborNode);
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
// MIGHT NEED TO FILTER OUT DIAGONALS?
function GetAdjacentCoordinates(node, maxWidth, maxHeight){
    var coordList = [];
    for(var x = -1; x <= 1; x++)
    {
         for(var y = -1; y <= 1; y++)
         {
             var xCoord = (node.x + x);
             var yCoord = (node.y + y);
             // if the new coordinates are within map bounds, and not equal to the node itself
             if((xCoord <= maxWidth && xCoord >= 0) && (yCoord <= maxHeight && yCoord > 0) 
             && !(x == 0 && y == 0)){
                 var coord = new Object();
                 coord.x = xCoord;
                 coord.y = yCoord;
                 coordList.push(coord);
             }
         }
    }
    console.log(coordList);
    return coordList;
}