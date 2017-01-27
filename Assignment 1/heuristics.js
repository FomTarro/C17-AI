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

// total time spent on actions by the agent as of it's current position
var total_time;


function SetHeuristics(current_x, current_y, goal_x, goal_y)
{
	// find the absolute distances of the x and y coordinates of the agent's current position and the goal
	horizontal = findAbsDistanceOfX(current_x, goal_x);
	vertical = findAbsDistanceOfY(current_y, goal_y);

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
	if ((heuristics !== undefined) && (h0 <= h1 || h1 <= h2 || h2 <= h3 || h3 <= h4))
	{
		return heuristics;
	}
	else
	{
		throw new DominateException("One or multiple heuristics is invalid");
	}


}

function DominateException(message)
{
	this.message = message;
	this.name = "DominateException";
}

var heuristic = (function() {
	this.SetHeuristics = SetHeuristics;
	this.findAbsDistanceOfX = function(x1, x2)
	{
		var absDisX = Math.abs(x1 - x2);
		return absDisX;
	}
	this.findAbsDistanceOfY = function(y1, y2)
	{
		var absDisY = Math.abs(y1 - y2);
		return absDisY;
	}
	this.Min = function(vertical, horizontal)
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
	this.Max = function(vertical, horizontal)
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
	this.Manhattan = function(vertical, horizontal)
	{
		var manhattan_dist = vertical + horizontal;
		return manhattan_dist;
	}

	return this;
})

module.exports = heuristic;