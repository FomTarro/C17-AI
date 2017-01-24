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
    }
    else {
        this.complexity = complexity;
    }

    return this;
}

console.log(new Cell(0, 0, "#"));

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
    var closedSet = {};
    // Currently discovered nodes that are also evaluated
    var openSet = {start};

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

        if(current == goal)
        {
            // exit this function which triggers path construction
            return true;
        }
        openSet.remove(current);
        closedSet.add(current);

        var neighbors = GetAdjacentCoordinates(current, _map.width, _map.height);
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

            if(!openSet.contains(neighborNode)) // discover a new node
            {
                openSet.add(neighborNode);
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
    var maxWidth = map.width;
    var maxHeight = map.height;
    var mapList = {};
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