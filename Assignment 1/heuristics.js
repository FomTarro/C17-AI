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

// may not need these idk
var curr_pos;
var goal;
var heuristics = {h0, h1, h2, h3, h4, h5};

// total time spent on actions by the agent as of it's current position
var total_time;

// the absolute distances of the xy coordinates of the curr position an goal
var vertical;
var horizontal;

// xy coordinates of current position
var x1;
var y1;
// xy coordinates of goal position
var x2;
var y2;

function setHeuristics()
{

	//TODO: retrieve the xy coordinates of the positions of the agent and the goal here

	// find the absolute distances of the x and y coordinates of the agent's current position and the goal
	horizontal = findAbsDistanceOfX(x1, x2);
	vertical = findAbsDistanceOfY(y1, y2);

	// start with base heuristic of 0
	try {
		h0 = 0;

		// find the min heuristic
		h1 = Min(vertical, horizontal);

		// same for the max heuristic
		h2 = Max(vertical, horizontal);

		// find the "manhattan" heuristic
		h3 = Manhattan(vertical, horizontal);

		// find the true goal cost as of the current unit of time spent and store it as a heuristic
		// (this is an admissable heuristic)
		h4 = h3 / total_time;

		// find a non-admissable heuristic
		h5 = h4 * 3;
	} catch(e)
	{
		alert("something went wrong assigning heuristics");
	}


	// TODO: check for dominate heuristics here
	if (heuristics !== undefined) && (h0 <= h1 || h1 <= h2 || h2 <= h3 || h3 <= h4)
	{
		return heuristics;
	}
	else
	{
		throw new DominateException("One or multiple heuristics is invalid");
	}


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

	if (vertical > horizontal)
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
	if (horizontal > vertical)
	{
		return horizontal;
	}

	if (horizontal < vertical)
	{
		return vertical;
	}
	if (horizontal == vertical)
	{
		return horizontal;
	}
}

function Manhattan(vertical, horizontal)
{
	var manhattan_dist = vertical + horizontal;
	return manhattan_dist;
}

function DominateException(message)
{
	this.message = message;
	this.name = "DominateException";
}