var aMonMove = require('./move');
var MoveData = require('./PokeClient/moves').BattleMovedex;
var move;
var bestIndividualMove;
var bestTeamMove;
var switch_ID = 0;
var isSwitch = false;

function QueryMove(aMove) 
{
	console.log("QUERY");
	console.log(MoveData[aMove]);
	return MoveData[aMove];
}

// function getMovePower(aMove)
// {
// 	console.log("RETRIEVING MOVE POWER");
// 	if (aMove.includes("60"))
// 	    {
// 	    	aMove = aMove.substring(0, aMove.indexOf("60"));
// 	    }
// 	console.log(MoveData[aMove].basePower);
// 	return MoveData[aMove].basePower;
// }

function getMoveType(aMove)
{
	console.log("RETRIEVING MOVE TYPE");
	if (aMove.includes("60"))
	    {
	    	aMove = aMove.substring(0, aMove.indexOf("60"));
	    }
	console.log(MoveData[aMove].type);
	return MoveData[aMove].type;
}

function ParseMoveData(data) {

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getIsSwitch()
{
	return isSwitch;
}

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

	var moveID = 0;
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
	var enemyResistances = enemyPoke.resistances;
	var enemyImmunities = enemyPoke.immunities;

	var movePicked = false;
	var isTeam = false;

	// start with super effective moves
	var LEVEL_EFFECTIVE = 2;

	console.log("Looking for a supereffective move...");
	movePicked = searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE);

	// if bot unable to pick a supereffective move, look at the other team pokes
	if (movePicked == false)
	{
		console.log("This pokemon has no supereffective moves.");
		console.log("Looking for a supereffective move in the team...");
		movePicked = searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, LEVEL_EFFECTIVE);
		// if a supereffective move was found, switch out
		if (movePicked == true)
		{
			isSwitch = true;
			//_ourActiveMon = _ourTeam[switch_ID]
		}
		else
		{
			console.log("The team has no supereffective moves.");
			console.log("Looking for an effective move...");
			// too bad, look for moves with normal effectiveness
			LEVEL_EFFECTIVE = 0;

			movePicked = searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE);
			// there were no normal moves, so look for a team poke that has one
			// NOTE: THIS IS NOT TAKING INTO ACCOUNT TEAM POKE STATS SO THE CHOSEN POKE MAY BE A BAD CHOICE
			if (movePicked == false)
			{
				console.log("This pokemon has no effective moves.");
				console.log("Looking for an effective move in the team...");
				movePicked = searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, LEVEL_EFFECTIVE);
				if (movePicked == true)
				{
					isSwitch = true;
					//_ourActiveMon = _ourTeam[switch_ID];
				}
				else
				{
					// poor bot is getting desperate. look for a move that is resistant
					LEVEL_EFFECTIVE = 1;
					console.log("The team has no effective moves.");
					console.log("Looking for a resistant move...");
					movePicked = searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE);
					if (movePicked == false)
					{
						console.log("This pokemon has no resistant moves.");
						console.log("Looking for a resistant move in the team...");
						isSwitch = true;
						// search the team for a pokemon with moves that are resistant
						movePicked = searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, LEVEL_EFFECTIVE);
						if (movePicked == true)
						{
							isSwitch = true;
							//_ourActiveMon = _ourTeam[switch_ID];
						}
						else
						{
							console.log("Sucks to be you. Pick randomly!");
							// wow, that sucks. pick a move at random since they're all ineffective
							moveID = getRandomInt(1, currPoke.moves.length);
							move = moves[moveID]
						}
					}
				}
			}
		}
	}

	console.log("I'm returning the move I picked");
	console.log(JSON.stringify(move));
	// bot has picked a move, return it
	return move;
}

function setMove(aMove)
{
	console.log("Setting move");
	move = QueryMove(aMove);
	console.log(move);
}

function setHighestIndividual(aMove)
{
	bestIndividualMove = aMove;
}

function checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam)
{
	var movePicked = false;
	var thisMoveBasePower = 0;
	//var bestMoveBasePower = getMovePower(bestMoveForThisMon);
	console.log("BEST MOVES: "+ bestMoves);
	// check that there were possible good moves, otherwise return false
	if (bestMoves.length > 0)
	{
		// pick the move with the highest base power
		// TODO: Add the algorithm to measure tradeoff of power vs accuracy
// 		for (var j = 0; j < bestMoves.length; j++)
// 		{
// 			console.log("This move's base power:");
// 			console.log(bestMoves[j].basePower);
// 			thisMoveBasePower = getMovePower(bestMoves[j]);
// 			if (bestMoveBasePower < thisMoveBasePower)
// 			{
// 				bestMoveForThisMon = bestMoves[j];
// 			}
// 		}
		console.log("Best move for this pokemon: " + JSON.stringify(bestMoveForThisMon));
		if (isTeam)
		{
			console.log("This is a team search");
			// we're doing team comparisons
			setHighestIndividualMove(bestMoveForThisMon);
		}
		else
		{
			console.log("This is a single search");
			// just looking for the best field poke move
			setMove(bestMoveForThisMon);
		}
		movePicked = true;
	}
	return movePicked;
}

function searchEffectiveMoves(moves, enemyResistances, enemyImmunities, isTeam)
{
	var movePicked = false;
	var bestMoves = [];
	var isResistant = false;
	var isImmune = false;
	var bestMoveForThisMon = new aMonMove();

	console.log("Moves: " + moves);
	//console.log("Enemy weaknesses: " + enemyWeaknesses);
	console.log("Enemy resistances: " + enemyResistances);
	console.log("Enemy immunities: " + enemyImmunities);

	for (var i = 0; i < moves.length; i++)
	{
		// assume that this method is only called after super effective moves have been searched
		for (var j = 0; j < enemyResistances.length; j++)
		{
			if (enemyResistances[j].type.includes(moveType))
			{
				isResistant = true;
			}
		}
		for (var k = 0; k < enemyImmunities.length; k++)
		{
			if (enemyImmunities[k].type.includes(moveType))
			{
				isImmune = true;
			}
		}
		// if this move is not resistant or immune, it is effective
		if (!isResistant && !isImmune)
		{
			bestMoves.push(moves[i]);
		}
	}
	movePicked = checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam);
	
	return movePicked;
}

function searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, effectiveness)
{
	var movePicked = false;
	var bestMoves = [];
	var bestMoveForThisMon = new aMonMove();

	console.log("Moves: " + moves);
	//BUG TODO: getting undefined for enemyType
	console.log("Enemy weaknesses: " + JSON.stringify(enemyWeaknesses));

	if (effectiveness == 2)
	{
		for (var i = 0; i < moves.length; i++)
		{
			console.log("Looking at move: " + moves[i])
			//console.log("Looking at move type: " + moves[i].type)
			for(var j = 0; j < enemyWeaknesses.length; j++)
			{
				moveType = getMoveType(moves[i]);
				//QueryMove(moves[i]);
				//console.log("Looking at weakness: " + enemyWeaknesses[j]);
				console.log("Looking at weakness type: " + enemyWeaknesses[j].type);
				// if this move is effective, add it to the list
				if (enemyWeaknesses[j].type.includes(moveType))
				{
					bestMoves.push(moves[i]);
				}
			}
		}
		movePicked = checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam);
	}
	
	if (effectiveness == 0)
	{
		movePicked = searchEffectiveMoves(moves, enemyResistances, enemyImmunities, isTeam);
	}
	
	if (effectiveness == 1)
	{
		for (var i = 0; i < moves.length; i++)
		{
			console.log("Looking at move: " + moves[i])
			//console.log("Looking at move type: " + moves[i].type)
			for(var j = 0; j < enemyResistances.length; j++)
			{
				moveType = getMoveType(moves[i]);
				//QueryMove(moves[i]);
				//console.log("Looking at weakness: " + enemyWeaknesses[j]);
				console.log("Looking at weakness type: " + enemyResistances[j].type);
				// if this move is effective, add it to the list
				if (enemyResistances[j].type.includes(moveType))
				{
					bestMoves.push(moves[i]);
				}
			}
		}
		movePicked = checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam);
	}
	return movePicked;
}

function searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, effectiveness)
{
	var movePicked = false;
	var isTeam = true;
	for (var i = 0; i < teamPokes.length; i++)
	{
		movePicked = searchMoves(teamPokes[i].moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, effectiveness);
// 		if (bestTeamMove.basePower > bestIndividualMove.basePower)
// 		{
// 			// the overall team move is better, so pick that one
// 			move = bestTeamMove;
// 		}
// 		else
// 		{
// 			// the last pokemon searched had a move with higher power, so pick that one
// 			move = bestIndividualMove;
// 			switch_ID = i;
// 		}
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
