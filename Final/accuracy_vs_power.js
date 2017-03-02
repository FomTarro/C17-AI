var move;
var bestIndividualMove;
var bestTeamMove;
var switch_ID = 0;

/** An algorithm that chooses an action to take based on the heuristic of the tradeoff between 
*   power and accuracy of a move.
*
*   Every move has a heuristic that is determined by the ratio of its accuracy vs. its
*   basePower. While move accuracy is normally a percentage, the algorithm considers
*   accuracy to be a whole number (e.g. a move with accuracy of 85% is considered
*   to have accuracy of 85) in order to compare it to power.
*
*   Tradeoff is calculated by the ratio power : accuracy. An example:
*	THUNDERBOLT: Power = 90, Accuracy = 100 -> 90 : 100 -> 9 : 10 -> tradeoff = 0.9
* 	THUNDER: Power = 110, Accuracy = 70 -> 110 : 70 -> 11 : 7 -> tradeoff = 0.63
*	In this case, the algorithm will choose thunderbolt as the best move.
*
*   The function keeps track of the best move it has found thus far and returns it.
*/
function PrioritizePowerAccuracy(currPoke, teamPokes, enemyPoke)
{
	// the heuristic for this algorithm
	var tradeoff = 0;

	// 4 moves the current bot pokemon can use
	var moves = currPoke.moves;
	// the list of the opposing pokemon team; starts empty and fills as switches happen
	var enemyTeam = [];
	// known moves by the curr enemy field pokemon
	var enemyPokeMoves = [];

	// the type of the current enemy field poke
	var enemyType = enemyPoke.type;

	var movePicked = false;
	var isTeam = false;

	
}

function searchMoves(moves, enemyType, tradeoff, isTeam)
{
	var move;
	var movePicked = false;
	var bestMoves = [];
	var bestMoveForThisMon;

	console.log("Moves: " + moves);
	//BUG TODO: getting undefined for enemyType
	console.log("Enemy type: " + enemyType);

	for (var i = 0; i < moves.length; i++)
	{
		// if this move is effective, add it to the list
		if (effectivenessJSON.weaknesses.includes(moves[i].type))
		{
			bestMoves.push(moves[i]);
		}
		// if (enemyType.damageTaken(moves[i].type) == effectiveness)
		// {
		// 	bestMoves.push(moves[i]);
		// }
	}

	// check that there were possible good moves, otherwise return false
	if (bestMoves.length != 0)
	{
		// pick the move with the highest base power
		for (var j = 0; j < bestMoves.length; j++)
		{
			if (bestMoveForThisMon.basePower < bestMoves[j].basePower)
			{
				bestMoveForThisMon = bestMoves[j];
			}
		}
		if (isTeam)
		{
			// we're doing team comparisons
			setHighestIndividualMove(bestMoveForThisMon);
		}
		else
		{
			// just looking for the best field poke move
			setMove(bestMoveForThisMon);
		}
		movePicked = true;
	}

	return movePicked;
}