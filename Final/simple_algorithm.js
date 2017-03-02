var move;
var bestIndividualMove;
var bestTeamMove;
var switch_ID = 0;

/* An algorithm that chooses an action to take based on the supereffectiveness of the move
*  on the enemy pokemon.
*
*  If the current field poke has no supereffective moves, the bot will switch to a pokemon
*  on the team that has supereffective moves against the current enemy field pokemon. The bot assesses
*  the enemy weaknesses at the start of the algorithm, so the next time the function is called, it will
*  update it's move choice based on the enemy poke's response (switch or stay).
*
*  If no team pokes have supereffective moves, the bot will search for a move with normal effectiveness.
*  If there are multiple moves with normal effectiveness, it will pick the move with the highest base power 
*  for the current field pokemon. If the current field pokemon has no normal effective moves, it will search 
*  the rest of the team for a pokemon with normally effective moves, the bot will switch out if one is available.
*
*  If there are no super effective moves and no normally effective moves on the team, the bot will pick a move
*  with the highest base power for the current field pokemon. If the current field pokemon only has ineffective
*  moves, the bot will search the team for a poke with resistant moves.
*
*  If all team moves are ineffective, the bot will pick a random move for the current field pokemon.
*
*  Currently this algorithm does not take into account:
		- the bot's team poke weaknesses/resistances
		- bot & and enemy poke items
		- pokemon statuses (increased att/def/spattack etc.)
		- other base stats (speed, spdef, etc.)
		- number of turns
		- PP
		- lots of other minor factors...........
*  currPoke: the bot's pokemon currently out on the field
*  teamPokes: a list of all pokemon on the bot's team (including the pokemon currently on the field)
*  enemyPoke: the opponent pokemon currently visible on the field
*/
function PrioritizeSuperEffective(currPoke, teamPokes, enemyPoke)
{

	console.log(enemyPoke);	

	// 4 moves the current bot pokemon can use
	var moves = currPoke.moves;
	// the list of the opposing pokemon team; starts empty and fills as switches happen
	var enemyTeam = [];
	// known moves by the curr enemy field pokemon
	var enemyPokeMoves = [];


	// the heuristic to base decisions on
	/* type matchups according to the type-chart:
		3: ineffecive; no damage
		2: super effective; damage x2
		1: resistant; damage halved
		0: normal; damage based on move power/pokemon stats
	*/
	//BUG TODO: This returns undefined
	var enemyWeaknesses = enemyPoke.weaknesses;

	var movePicked = false;
	var isTeam = false;


	//var LEVEL_EFFECTIVE = 2;

	movePicked = searchMoves(moves, enemyWeaknesses, isTeam);

	// if bot unable to pick a supereffective move, look at the other team pokes
	if (movePicked == false)
	{
		movePicked = searchTeamMoves(teamPokes, enemyWeaknesses);
		// if a supereffective move was found, switch out
		if (movePicked == true)
		{
			_ourActiveMon = _ourTeam[switch_ID]
		}
		else
		{
			// too bad, look for moves with normal effectiveness
			LEVEL_EFFECTIVE = 0;

			movePicked = searchMoves(moves, enemyWeaknesses, isTeam);
			// there were no normal moves, so look for a team poke that has one
			// NOTE: THIS IS NOT TAKING INTO ACCOUNT TEAM POKE STATS SO THE CHOSEN POKE MAY BE A BAD CHOICE
			if (movePicked == false)
			{
				movePicked = searchTeamMoves(teamPokes, enemyWeaknesses);
				if (movePicked == true)
				{
					_ourActiveMon = _ourTeam[switch_ID];
				}
				else
				{
					// poor bot is getting desperate. look for a move that is resistant
					LEVEL_EFFECTIVE = 1;

					movePicked = searchMoves(moves, enemyWeaknesses, isTeam);
					if (movePicked == false)
					{
						// search the team for a pokemon with moves that are resistant
						movePicked = searchTeamMoves(teamPokes, enemyWeaknesses);
						if (movePicked == true)
						{
							_ourActiveMon = _ourTeam[switch_ID];
						}
						else
						{
							// wow, that sucks. pick a move at random since they're all ineffective
							move = getRandomInt(1, _ourActiveMon.moves.length);
						}
					}
				}
			}
		}
	}

	// bot has picked a move, return it
	return move;
}

function setMove(aMove)
{
	move = aMove;
}

function setHighestIndividual(aMove)
{
	bestIndividualMove = aMove;
}

function searchMoves(moves, enemyWeaknesses, isTeam)
{
	var move;
	var movePicked = false;
	var bestMoves = [];
	var bestMoveForThisMon;

	console.log("Moves: " + moves);
	//BUG TODO: getting undefined for enemyType
	console.log("Enemy type: " + enemyWeaknesses);

	for (var i = 0; i < moves.length; i++)
	{
		// if this move is effective, add it to the list
		if (enemyWeaknesses.includes(moves[i].type))
		{
			bestMoves.push(moves[i]);
		}
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

function searchTeamMoves(teamPokes, enemyWeaknesses)
{
	var movePicked = false;
	var isTeam = true;
	for (var i = 0; i < teamPokes.length; i++)
	{
		movePicked = searchMoves(teamPokes[i].moves, enemyWeaknesses, isTeam);
		if (bestTeamMove.basePower > bestIndividualMove.basePower)
		{
			// the overall team move is better, so pick that one
			move = bestTeamMove;
		}
		else
		{
			// the last pokemon searched had a move with higher power, so pick that one
			move = bestIndividualMove;
			switch_ID = i;
		}
	}
	return movePicked;
}

/**
 * This is the exports object that will be imported into the client code 
 * and used by the client to determine which move to use next
 */
var PoketronAlgorithm = function() {
	this.searchMoves = searchMoves;
	this.searchTeamMoves = searchTeamMoves;
	this.setMove = setMove;
	this.setHighestIndividual = setHighestIndividual;
	this.PrioritizeSuperEffective = PrioritizeSuperEffective;
	return this;
};

module.exports = PoketronAlgorithm();
