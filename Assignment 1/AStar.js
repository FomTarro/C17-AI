/*
a Node needs the folowing properties:

G (intitially infinity)
H (heuristic)
F = (g + h) = cost
parentNode;


*/

// TODO: some sort of persistent node grid stored here;
// ideally a 2d array of x, y coordinates
var _map = {};

// generate an Astar path
function AStarPath(start, goal){
    var success = Search(start, goal);
    var plannedPath = {};
    if(success){
        var node = goal;
        plannedPath.add(node);
        node = node.parentNode;
    }

    plannedPath.reverse();

    return plannedPath;
}

// Do the Astar search
function Search(start, goal)
{
    // Already evaluated nodes go here
    var _closedSet = {};
    // Currently discovered nodes that are also evaluated
    var _openSet = {start};

    start.g = 0;

    while(_openSet.length > 0)
    {
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
        _openSet.remove(current);
        _closedSet.add(current);

        var neighbors = GetAdjacentCoordinates(current, _map.width, _map.height);
        for(var i = 0; i < neighbors.length; i++){
            var neighborNode; // set this to neighbors[i].x, neighbors[i].y from the map structure

            // check if node with these coordinates exists in the closed set
            // if so, continue

            // assumes cost between each tile is just 1
            // this would be where to insert heuristics
            var gTemp = current.g + 1;

            if(!_openSet.contains(neighborNode)) // discover a new node
            {
                _openSet.add(neighborNode);
            }
            else if(gTemp >= neighborNode.G) // this is not a better path
            {
                continue;
            }

            // this is the best path until now, so record itself
            neighborNode.parentNode = current;
            neighborNode.G = gTemp;
        }

        return false;
    }

// Pass in a node and the extremes of the map, gets all valid adjacent coordinates. 
// Assumes minimum bounds are zero. 
// MIGHT NEED TO FILTER OUT DIAGONALS?
function GetAdjacentCoordinates(node, maxWidth, maxHeight){
    var coordList = {};
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
                 coordList.add(coord);
             }
         }
    }
    return coordList;
}

}