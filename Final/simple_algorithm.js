var move = 0;

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
*  with the highest base power for the current field pokemon.
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
function PriotizeSuperEffective(currPoke, teamPokes, enemyPoke)
{
	// 4 moves the current bot pokemon can use
	var moves = currPoke.moves;
	// the list of the opposing pokemon team; starts empty and fills as switches happen
	var enemyTeam = {};
	// known moves by the curr enemy field pokemon
	var enemyPokeMoves = {};

	// the type of the current enemy field poke
	var enemyType = enemyPoke.type;

	var movePicked = false;

	// the heuristic to base decisions on
	/* type matchups according to the type-chart:
		3: ineffecive; no damage
		2: super effective; damage x2
		1: resistant; damage halved
		0: normal; damage based on move power/pokemon stats
	*/
	var LEVEL_EFFECTIVE = 2;

	movePicked = searchMoves(moves, enemyType, LEVEL_EFFECTIVE);

	// if bot unable to pick a supereffective move, look at the other team pokes
	if (movePicked == false)
	{
		movePicked = searchTeamMoves(teamPokes, enemyType, LEVEL_EFFECTIVE);
		// if a supereffective move was found, switch out
		if (movePicked == true)
		{
			_ourActiveMon = _ourTeam[i]
		}
		else
		{
			// too bad, look for moves with normal effectiveness
			LEVEL_EFFECTIVE = 0;

			movePicked = searchMoves(moves, enemyType, LEVEL_EFFECTIVE);
			// there were no normal moves, so look for a team poke that has one
			// NOTE: THIS IS NOT TAKING INTO ACCOUNT TEAM POKE STATS/MOVE POWER SO THE CHOSEN POKE MAY BE A BAD CHOICE
			if (movePicked == false)
			{
				movePicked = searchTeamMoves(teamPokes, enemyType, LEVEL_EFFECTIVE);
				if (movePicked == true)
				{
					_ourActiveMon = _ourTeam[i];
				}
				else
				{
					// poor bot is getting desperate. look for a move that is resistant
					LEVEL_EFFECTIVE = 1;

					movePicked = searchMoves(moves, enemyType, LEVEL_EFFECTIVE);
					if (movePicked == false)
					{
						// search the team for a pokemon with moves that will do something
						movePicked = searchTeamMoves(teamPokes, enemyType, LEVEL_EFFECTIVE);
						if (movePicked == true)
						{
							_ourActiveMon = _ourTeam[i];
						}
						else
						{
							// wow, that sucks. pick a move at random
							move = getRandomInt(1, _ourActiveMon.moves.length);
						}
					}
				}
			}
		}
	}

	// bot has picked a move, so return it
	return move;
}

function setMove(aMove)
{
	move = aMove;
}

function searchMoves(moves, enemyType, effectiveness)
{
	var move;
	var movePicked = false;
	for (var i = 0; i < moves.length; i++)
	{

		if (enemyType.damageTaken(moves[i].type) == effectiveness)
		{
			setMove(moves[i]);
			movePicked = true;
		}
	}
	return movePicked;
}

function searchTeamMoves(teamPokes, enemyType, effectiveness)
{
	for (var i = 0; i < teamPokes.length; i++)
	{
		var movePicked = searchMoves(teamPokes[i].moves, enemyType, effectiveness);
	}
	return movePicked;
}