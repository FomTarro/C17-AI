var aMonMove = require('./move');
var MoveData = require('./PokeClient/moves').BattleMovedex;
var move;
var bestIndividualMove;
var bestTeamMove;
var switch_ID = 0;
var isSwitch = false;

var rankedArray = [];

function QueryMove(aMove) {
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

function getMoveType(aMove) {
	//console.log("RETRIEVING MOVE TYPE");
	if (aMove.includes("60")) {
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

function getIsSwitch() {
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
function PrioritizeSuperEffective(currPoke, teamPokes, enemyPoke) {
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
}

function setMove(aMove) {
	//console.log("Setting move");
	move = QueryMove(aMove);
	//console.log(move);
}

function setHighestIndividual(aMove) {
	bestIndividualMove = aMove;
}

function checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam) {

}

function searchEffectiveMoves(moves, enemyResistances, enemyImmunities, isTeam, enemyWeaknesses) {
	var movePicked = false;
	var bestMoves = [];
	var isResistant = false;
	var isImmune = false;
	var isWeak = false;
	var bestMoveForThisMon = new aMonMove();

	//console.log("Moves: " + moves);
	//console.log("Enemy weaknesses: " + enemyWeaknesses);
	//console.log("Enemy resistances: " + JSON.stringify(enemyResistances));
	//console.log("Enemy immunities: " + JSON.stringify(enemyImmunities));

	for (var i = 0; i < moves.length; i++) {
		for (var j = 0; j < enemyResistances.length; j++) {
			if (enemyResistances[j].type.includes(moveType)) {
				isResistant = true;
			}
		}
		for (var k = 0; k < enemyImmunities.length; k++) {
			if (enemyImmunities[k].type.includes(moveType)) {
				isImmune = true;
			}
		}
		for (var l = 0; l < enemyWeaknesses.length; l++) {
			if (enemyWeaknesses[l].type.includes(moveType)) {
				isWeak = true;
			}
		}
		// if this move is not resistant or immune, it is effective
		if (!isResistant && !isImmune && !isWeak) {
			console.log("EFFECTIVE MOVE ADDED " + moves[i]);
			bestMoves.push(moves[i]);
		}
	}
	console.log("Best Effective Moves: " + bestMoves);
	checkGoodMoves(bestMoves, bestMoveForThisMon, isTeam);

	return movePicked;
}

function searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, effectiveness) {
	var movePicked = false;
	var bestMoves = [];
	var bestMoveForThisMon = new aMonMove();
	var multipliers = [];

	//console.log("Moves: " + moves);
	//console.log("Enemy weaknesses: " + JSON.stringify(enemyWeaknesses));
	bestMoves = moves;
	for (var i = 0; i < moves.length; i++) {
		var moveType = getMoveType(moves[i]);
		multipliers[i] = 1;
		for (var j = 0; j < enemyWeaknesses.length; j++) {
			if (enemyWeaknesses[j].type.includes(moveType)) {
				multipliers[i] = (enemyWeaknesses[j].multiplier);
			}
		}
		for (var j = 0; j < enemyResistances.length; j++) {
			if (enemyResistances[j].type.includes(moveType)) {
				multipliers[i] = (enemyResistances[j].multiplier);
			}
		}
		for (var j = 0; j < enemyImmunities.length; j++) {
			if (enemyImmunities[j].type.includes(moveType)) {
				multipliers[i] = (enemyImmunities[j].multiplier);
			}
		}
	}

	//console.log("BEST MOVES: " + bestMoves);

	return bestMovePowAcc(bestMoves, multipliers, moves);
}

function searchTeamMoves(teamPokes, enemyWeaknesses, enemyResistances, enemyImmunities, effectiveness) {
	var movePicked = false;
	var isTeam = true;
	for (var i = 0; i < teamPokes.length; i++) {
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

function BestIsBad(currPokem, teamPokemons, enemyPokem) {
	rankedArray = [];

	var moveID = 0;
	//console.log(enemyPoke);

	// 4 moves the current bot pokemon can use
	var moves = currPokem.moves;
	// the list of the opposing pokemon team; starts empty and fills as switches happen
	var enemyTeam = [];
	// known moves by the curr enemy field pokemon
	var enemyPokeMoves = [];

	var enemyWeaknesses = enemyPokem.weaknesses;
	var enemyResistances = enemyPokem.resistances;
	var enemyImmunities = enemyPokem.immunities;

	var movePicked = false;
	var isTeam = false;

	// start with super effective moves
	var LEVEL_EFFECTIVE = 2;

	//console.log("Looking for a supereffective move...");
	var moveType = getMoveType(moves[searchMoves(moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE)[0]]);
	for (var j = 0; j < enemyResistances.length; j++) {
		if (enemyResistances[j].type.includes(moveType)) {
			return true;
		}
	}
	for (var j = 0; j < enemyImmunities.length; j++) {
		if (enemyImmunities[j].type.includes(moveType)) {
			return true;
		}
	}

	return false;
}

function SmartSwitch(ourPokes, enemyPokem) {

	var enemyWeaknesses = enemyPokem.weaknesses;
	var enemyResistances = enemyPokem.resistances;
	var enemyImmunities = enemyPokem.immunities;

	var movePicked = false;
	var isTeam = false;

	// start with super effective moves
	var LEVEL_EFFECTIVE = 2;

	//look for a mon with a super effective move
	for (var i = 0; i < 6; i++) {
		if (!ourPokes[i].condition.includes('fnt')) {
			var moveType = getMoveType(ourPokes[i].moves[searchMoves(ourPokes[i].moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE)[0]]);
			for (var j = 0; j < enemyWeaknesses.length; j++) {
				if (enemyWeaknesses[j].type.includes(moveType)) {
					return i;
				}
			}
		}
	}

	//look for a mon that has a move that isnt weak against the opponent
	for (var i = 0; i < 6; i++) {
		if (!ourPokes[i].condition.includes('fnt')) {
			var moveType = getMoveType(ourPokes[i].moves[searchMoves(ourPokes[i].moves, enemyWeaknesses, enemyResistances, enemyImmunities, isTeam, LEVEL_EFFECTIVE)[0]]);
			for (var j = 0; j < enemyResistances.length; j++) {
				if (!enemyResistances[j].type.includes(moveType)) {

					for (var j = 0; j < enemyImmunities.length; j++) {
						if (!enemyImmunities[j].type.includes(moveType)) {
							return i;
						}
					}

				}
			}
		}
	}

	//just give a random mon
	return getRandomInt(0, 5);
}

function EscapeStrongMove(currWeaknesses, enemyPokem) {

	for (var i = 0; i < enemyPokem.moves.length; i++) {
		//console.log("MOVE IN Q: " + enemyPokem.moves[i].toLowerCase().split(' ').join(''));
		var theMove = enemyPokem.moves[i].toLowerCase().split(' ').join('').replace(/-/gm, '');
		//console.log("MOVE IN Q: " + theMove);
		var moveType = QueryMove(theMove).type;

		for (var j = 0; j < currWeaknesses.length; j++) {
			if (currWeaknesses[j].type == moveType)
				return true;
		}
	}

	return false;
}

//returns the best move by considering the ratio between power and accuracy
function bestMovePowAcc(movesList, multipliers, moves) {
	var bestRatio = 0.0;
	var bestMoveIndex = -1;
	var curRatio = 0.0;
	var curIndex = 0;

	var finalAccuracy = 0;

	var ratios = [];
	var rankedMoveIndecies = [];

	movesList.forEach(function(d) {
		curRatio = 0.0;
		finalAccuracy = 0;

		if (d.includes("60"))
			d = d.substring(0, d.indexOf("60"));

		if (QueryMove(d).basePower > 0) {
			if (QueryMove(d).accuracy == true)
				finalAccuracy = 100;
			else {
				finalAccuracy = QueryMove(d).accuracy;
			}

			/*if(QueryMove(d).basePower < finalAccuracy)
			 curRatio = QueryMove(d).basePower/finalAccuracy;
			 else*/
			curRatio = finalAccuracy + (QueryMove(d).basePower * multipliers[curIndex]);

			if (curRatio > bestRatio) {
				bestRatio = curRatio;
				bestMoveIndex = curIndex;
			}

			ratios[curIndex] = curRatio + (curIndex / 10);
		} else
			ratios[curIndex] = 0 + (curIndex / 10);

		//console.log(d + " has a ratio of " + curRatio);

		curIndex++;
	});

	////console.log("Best move out of " + movesList + " is "+ movesList[bestMoveIndex] + " at index " + bestMoveIndex);
	var rankedRatios = [];

	for (var j = 0; j < 4; j++) {
		rankedRatios[j] = ratios[j];
	}

	rankedRatios = rankedRatios.sort();
	rankedRatios = rankedRatios.reverse();

	for (var i = 0; i < 4; i++) {
		rankedMoveIndecies[i] = ratios.indexOf(rankedRatios[i]);
	}

	//console.log("Ranked Moves: " + movesList[rankedMoveIndecies[0]] + ", " + movesList[rankedMoveIndecies[1]] + ", " + movesList[rankedMoveIndecies[2]] + ", " + movesList[rankedMoveIndecies[3]]);
	//console.log("Ranked Indecies: " + rankedMoveIndecies);
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
	this.BestIsBad = BestIsBad;
	this.SmartSwitch = SmartSwitch;
	this.EscapeStrongMove = EscapeStrongMove;
	return this;
};

module.exports = PoketronAlgorithm();
