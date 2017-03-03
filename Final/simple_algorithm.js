var aMonMove = require('./move');
var MoveData = require('./PokeClient/moves').BattleMovedex;
var move;
var bestIndividualMove;
var bestTeamMove;
var switch_ID = 0;
var isSwitch = false;

var rankedArray = [];

function QueryMove(aMove) 
{
	//console.log("QUERY");
	//console.log(MoveData[aMove]);
	return MoveData[aMove];
}

// function getMovePower(aMove)
// {
// 	//console.log("RETRIEVING MOVE POWER");
// 	if (aMove.includes("60"))
// 	    {
// 	    	aMove = aMove.substring(0, aMove.indexOf("60"));
// 	    }
// 	//console.log(MoveData[aMove].basePower);
// 	return MoveData[aMove].basePower;
// }

function getMoveType(aMove)
{
	//console.log("RETRIEVING MOVE TYPE");
	if (aMove.includes("60"))
	    {
	    	aMove = aMove.substring(0, aMove.indexOf("60"));
	    }
	//console.log(MoveData[aMove].type);
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
	rankedArray = [];

	var moveID = 0;
	//console.log(enemyPoke);	

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

	//console.log("Looking for a supereffective move...");
	return searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE);
	
	console.log("Moves: " + moves);
	console.log("Ranked Array: " + rankedArray);
	console.log("Ranked Moves: " + moves[rankedArray[0]] + ", " + moves[rankedArray[1]] + ", " + moves[rankedArray[2]] + ", " + moves[rankedArray[3]]);

	return rankedArray;

	// if bot unable to pick a supereffective move, look at the other team pokes
	if (movePicked == false)
	{
		//console.log("This pokemon has no supereffective moves.");
		//console.log("Looking for a supereffective move in the team...");
		//movePicked = searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, LEVEL_EFFECTIVE);
		// if a supereffective move was found, switch out
		if (movePicked == true)
		{
			isSwitch = true;
			//_ourActiveMon = _ourTeam[switch_ID]
		}
		else
		{
			//console.log("The team has no supereffective moves.");
			//console.log("Looking for an effective move...");
			// too bad, look for moves with normal effectiveness
			LEVEL_EFFECTIVE = 0;

			movePicked = searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE);
			// there were no normal moves, so look for a team poke that has one
			// NOTE: THIS IS NOT TAKING INTO ACCOUNT TEAM POKE STATS SO THE CHOSEN POKE MAY BE A BAD CHOICE
			if (movePicked == false)
			{
				//console.log("This pokemon has no effective moves.");
				//console.log("Looking for an effective move in the team...");
				//movePicked = searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, LEVEL_EFFECTIVE);
				if (movePicked == true)
				{
					isSwitch = true;
					//_ourActiveMon = _ourTeam[switch_ID];
				}
				else
				{
					// poor bot is getting desperate. look for a move that is resistant
					LEVEL_EFFECTIVE = 1;
					//console.log("The team has no effective moves.");
					//console.log("Looking for a resistant move...");
					movePicked = searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE);
					if (movePicked == false)
					{
						//console.log("This pokemon has no resistant moves.");
						//console.log("Looking for a resistant move in the team...");
						isSwitch = true;
						// search the team for a pokemon with moves that are resistant
						//movePicked = searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, LEVEL_EFFECTIVE);
						if (movePicked == true)
						{
							isSwitch = true;
							//_ourActiveMon = _ourTeam[switch_ID];
						}
						else
						{
							//console.log("Sucks to be you. Pick randomly!");
							// wow, that sucks. pick a move at random since they're all ineffective
							moveID = getRandomInt(1, currPoke.moves.length);
							move = moves[moveID]
						}
					}
				}
			}
		}
	}

	//console.log("I'm returning the move I picked");
	//console.log(JSON.stringify(move));
	// bot has picked a move, return it
	return move;
}

function setMove(aMove)
{
	//console.log("Setting move");
	move = QueryMove(aMove);
	//console.log(move);
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
	//console.log("BEST MOVES: "+ bestMoves);
	// check that there were possible good moves, otherwise return false
 	if (bestMoves.length > 0)
 	{
		// pick the move with the highest base power
		//var rankedBest = bestMovePowAcc(bestMoves);
		
		//rankedBest.forEach(function(d){
			//rankedArray.push(d);
		//});
		
		/*bestMoveForThisMon = bestMoves[0];
		//console.log("Best move for this pokemon: " + JSON.stringify(bestMoveForThisMon));
		if (isTeam)
		{
			//console.log("This is a team search");
			// we're doing team comparisons
			setHighestIndividualMove(bestMoveForThisMon);
		}
		else
		{
			//console.log("This is a single search");
			// just looking for the best field poke move
			setMove(bestMoveForThisMon);
		}
		movePicked = true;*/
	}
	return movePicked;
}

function searchEffectiveMoves(moves, enemyResistances, enemyImmunities, isTeam, enemyWeaknesses)
{
	var movePicked = false;
	var bestMoves = [];
	var isResistant = false;
	var isImmune = false;
	var isWeak = false;
	var bestMoveForThisMon = new aMonMove();

	console.log("Moves: " + moves);
	//console.log("Enemy weaknesses: " + enemyWeaknesses);
	//console.log("Enemy resistances: " + JSON.stringify(enemyResistances));
	//console.log("Enemy immunities: " + JSON.stringify(enemyImmunities));

	for (var i = 0; i < moves.length; i++)
	{
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
		for (var l = 0; l < enemyWeaknesses.length; l++)
		{
			if (enemyWeaknesses[l].type.includes(moveType))
			{
				isWeak = true;
			}
		}
		// if this move is not resistant or immune, it is effective
		if (!isResistant && !isImmune && !isWeak)
		{
			console.log("EFFECTIVE MOVE ADDED " + moves[i]);
			bestMoves.push(moves[i]);
		}
	}
	console.log("Best Effective Moves: " + bestMoves);
	checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam);
	
	return movePicked;
}

function searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, effectiveness)
{
	var movePicked = false;
	var bestMoves = [];
	var bestMoveForThisMon = new aMonMove();
	var multipliers = [];

	console.log("Moves: " + moves);
	console.log("Enemy weaknesses: " + JSON.stringify(enemyWeaknesses));

		for (var i = 0; i < moves.length; i++)
		{
			//console.log("Looking at move: " + moves[i])
			////console.log("Looking at move type: " + moves[i].type)
			for(var j = 0; j < enemyWeaknesses.length; j++)
			{
				moveType = getMoveType(moves[i]);
				//QueryMove(moves[i]);
				////console.log("Looking at weakness: " + enemyWeaknesses[j]);
				//console.log("Looking at weakness type: " + enemyWeaknesses[j].type);
				// if this move is effective, add it to the list
				if (enemyWeaknesses[j].type.includes(moveType))
				{
					bestMoves.push(moves[i]);
					multipliers.push(2);
				}
			}
		}
		//checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam);
	
	/*if (effectiveness == 0)
	{
		searchEffectiveMoves(moves, enemyResistances, enemyImmunities, isTeam, enemyWeaknesses);
	}*/
	

		for (var i = 0; i < moves.length; i++)
		{
			//console.log("Looking at move: " + moves[i])
			////console.log("Looking at move type: " + moves[i].type)
			for(var j = 0; j < enemyResistances.length; j++)
			{
				moveType = getMoveType(moves[i]);
				//QueryMove(moves[i]);
				////console.log("Looking at weakness: " + enemyWeaknesses[j]);
				//console.log("Looking at weakness type: " + enemyResistances[j].type);
				// if this move is effective, add it to the list
				if (enemyResistances[j].type.includes(moveType))
				{
					bestMoves.push(moves[i]);
					multipliers.push(.5);
				}
			}
		}
		//checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam);
		
		for (var i = 0; i < moves.length; i++)
		{
			//console.log("Looking at move: " + moves[i])
			////console.log("Looking at move type: " + moves[i].type)
			for(var j = 0; j < enemyImmunities.length; j++)
			{
				moveType = getMoveType(moves[i]);
				//QueryMove(moves[i]);
				////console.log("Looking at weakness: " + enemyWeaknesses[j]);
				//console.log("Looking at weakness type: " + enemyResistances[j].type);
				// if this move is effective, add it to the list
				if (enemyImmunities[j].type.includes(moveType))
				{
					bestMoves.push(moves[i]);
					multipliers.push(0);
				}
			}
		}
		
		for (var i = 0; i < moves.length; i++)
		{
				if (!bestMoves.includes(moves[i]))
				{
					bestMoves.push(moves[i]);
					multipliers.push(1);
				}
		}
		
		console.log("BEST MOVES: " + bestMoves);
		
		return bestMovePowAcc(bestMoves, multipliers, moves);
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

//returns the best move by considering the ratio between power and accuracy
function bestMovePowAcc(movesList, multipliers, moves){
	var bestRatio = 0.0;
	var bestMoveIndex = -1;
	var curRatio = 0.0;
	var curIndex = 0;
	
	var finalAccuracy = 0;
	
	var ratios = [];
	var rankedMoveIndecies = [];
	
	movesList.forEach(function(d){
		curRatio = 0.0;
		finalAccuracy = 0;
		
		if(d.includes("60"))
			d = d.substring(0, d.indexOf("60"));
			
		if(QueryMove(d).basePower > 0){
			if(QueryMove(d).accuracy == true)
				finalAccuracy = 100;
			else{
				finalAccuracy = QueryMove(d).accuracy;
			}
			
			/*if(QueryMove(d).basePower < finalAccuracy)
				curRatio = QueryMove(d).basePower/finalAccuracy;
			else*/
				curRatio = finalAccuracy + (QueryMove(d).basePower * multipliers[curIndex]);
				
			if(curRatio > bestRatio){
				bestRatio = curRatio;
				bestMoveIndex = curIndex;
			}
			
			ratios[curIndex] = curRatio;
		}
		else
			ratios[curIndex] = 0 + (curIndex/10);
		
		console.log(d + " has a ratio of " + curRatio);
		
		curIndex++;
	});
	
	////console.log("Best move out of " + movesList + " is "+ movesList[bestMoveIndex] + " at index " + bestMoveIndex);
	var rankedRatios = [];
	
	for(var j = 0; j < 4; j++){
		rankedRatios[j] = ratios[j];
	}
	
	rankedRatios = rankedRatios.sort();
	rankedRatios = rankedRatios.reverse();
	
	for(var i = 0; i < 4; i++){
		rankedMoveIndecies[i] = ratios.indexOf(rankedRatios[i]);
	}
	//HEY TOM U WERE HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	console.log("Ranked Moves: " + movesList[rankedMoveIndecies[0]] + ", " + movesList[rankedMoveIndecies[1]] + ", " + movesList[rankedMoveIndecies[2]] + ", " + movesList[rankedMoveIndecies[3]]);
	console.log("Ranked Indecies: " + rankedMoveIndecies);
	return rankedMoveIndecies;
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
