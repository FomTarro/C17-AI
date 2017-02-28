
function move() {
	/* possible callback functions not included:
	 * basePowerCallback
	 * onHit
	 * onTryHit
	 * (for an example, see the move Beak Blast)
	*/
	this.num = 0;

	this.accuracy = 0;

	this.basePower = 0;

	this.category = ""; // status, physical, or special

	this.desc = "";

	this.shortDesc = "";

	this.id = ""; // e.g. "aquatail"

	this.isViable = null; // boolean true/false

	this.name = ""; // e.g. "Aqua Tail"

	this.pp = 0;

	this.priority = 0; // 1 if move always lands first

	/* possible flags:
	*  protect
	*  mirror
	*  distance
	*  snatch
	*  contact
	*  authentic
	*  reflectable
	*  bullet
	*  pulse
	*  heal
	*  bite
	*  sound
	*  gravity
	*  charge
	*  nonsky
	*  mystery
	*/
	this.flags = {};

	this.isZ = null; // boolean true/false

	this.critRatio = 0;

	this.secondary = null; // boolean true/false; if true, contains the probability of the secondary effect occuring as well as those effects

	this.target = ""; // determines the target; normal = single opponent, allyTeam = another team mon on the field, self = this mon, etc.

	this.type = "";

	this.contestType = "";

	this.drain = []; // the varying strength of the drain

	this.zMovePower = 0;

	this.zMoveEffect = ""; // 'clearnegativeboost', 'heal'

	this.volatileStatus = ""; // the dynamic status of the mon that is changed by the move ('partiallytrapped', 'bide', etc.)

	this.effect = {}; // the move effect; conditional statements for a specific move go here

	this.multiHit = []; // can be a single digit if it hits a set amount of times or a range (e.g. 2 - 5 times in one time)

	this.boosts = {}; // stats that are boosted

	this.zMoveBoost = {};

	this.stallingMove = null; // boolean true/false

	this.selfSwitch = null; // boolean...? potentially can be 'copyvolatile'

	this.multiAccuracy = null; // boolean true/false

	this.noPPBoosts = null;

	this.sideCondition = "";

	this.selfDestruct = ""; //'ifHit', 'always'

	this.recoil = []; // range of recoil damage

	this.hasCustomRecoil = null; // boolean true/false

	this.isUnreleased = null // boolean true/false

	this.pressureTarget = ""; // 'foeSide'

	this.pseudoWeather = "";

	this.noFaint = null; // boolean true/false

	return this;
}

module.exports = move;
