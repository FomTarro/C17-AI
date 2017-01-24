// heuristics
// Miya

// assume each cell has a heuristic 1 - 9
// six heuristics total

/**
* currently these values are hard-coded, but we can change it later
*/

var h0;
var h1;
var h2;
var h3;
var h4;
var h5;
var heuristics = {h0, h1, h2, h3, h4, h5};
var curr_pos;
var goal;

// dunno if we need these yet
var vertical;
var horizontal;

// xy coordinates of current position
var x1;
var y1;
// xy coordinates of goal position
var x2;
var y2;

function setHeuristics(heuristics)
{

	// start with base heuristic of 0
	h0 = 0;

	// calculate the minimum heuristic based on abs distance from agent's current position and goal
	horizontal = findAbsDistanceOfX(x1, x2);
	vertical = findAbsDistanceOfY(y1, y2);
	h1 = Min(vertical, horizontal);

}

function findAbsDistanceOfX(x1, x2)
{
	absDisX = Math.abs(x1 - x2);
	return absDisX;
}

function findAbsDistanceOfY(y1, y2)
{
	absDisY = Math.abs(y1 - y2);
	return absDisYs;
}

function Min(vertical, horizontal)
{
	if (vertical < horizontal)
	{
		return vertical;
	}

	if (horizontal > vertical)
	{
		return horizontal;
	}

	// if the difference is the same, return horizontal by default
	if (horizontal == vertical)
	{
		return horizontal;
	}

}

function Max(vertical, horizontal)
{

}

function Manhattan(vertical, horizontal)
{

}