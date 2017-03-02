var PokeClient = require("./PokeClient/client");
var mon = require('./mon');
var MoveData = require('./PokeClient/moves').BattleMovedex;
var Algorithm = require('./simple_algorithm');
var _client = new PokeClient();
var Credentials = require("./credentials");
var _creds = new Credentials();

var BattleFormatsData = require("./formats-data");

// our team, stored in index order
var _ourTeam = [];
// their team, stored as a dictionary with species names as keys
// might be better to do theirs in index order as well, and use a species.includes(name) to check instead
// this will prevent confusion surrounding form changes
var _theirTeam =[];

// rules to consider (in general, only one enemy at a time can be under "sleep" status)
var _rules = [];
var _reqNum = 0;

// who we have out
var _ourActiveMon;
var _theirActiveMon;

// variables for which player in the room is who
var _weAre = '';
var _theyAre = ''; 

//Bool Flags So we can wait
var _weaknessFound = false;

_client.connect();

// Websocket has connected.
_client.on('ready', function() {
  _client.login(_creds.username, _creds.password);
});

// Successful login.
_client.on('login', function(event) {
  console.log('Logged in as:', event.data.username);
  _client.send("/avatar 167")
});

// Login failed.
_client.on('error:login', function(err) {
  console.log('Error encountered while logging in:', err.message);
});

// A message has been recieved from another player.
_client.on('chat:private', function(event){
  console.log(event.data.sender.trim() + ": " + event.data.message)
  if(event.data.sender.trim() != _creds.username){
     _client.send("/pm" + event.data.sender +  ", <I am a robot designed to play Random Battles!>")
  }
});

// A message has been recieved in a room you are in
_client.on('chat:public', function(event) {
  console.log(event.data);
});

// A chat command has given us back information in HTML format. Joy!
_client.on('chat:html', function(event) {
  //console.log(event.data)
  if(event.data.includes("Weaknesses")){

    var str = event.data.split('<div>')[1];
    str = str.split('</div>')[0];
    var effectiveness = str.split('<br />');
    effectiveness[0] = effectiveness[0].split(' ')[0];
    var effectivenessJSON = new Object();
    effectivenessJSON.species = effectiveness[0];
    for(var i = 1; i < effectiveness.length; i++){

      var tempArray = effectiveness[i].split(': ');
      var types =  tempArray[1].split(', ');

      for(var j = 0; j < types.length; j++){

        var effectivenessEntry = new Object();
        effectivenessEntry.type = types[j];
        switch(tempArray[0]){
          case "Weaknesses":
            if(types[j].includes('<b>')){
              effectivenessEntry.type = types[j].replace(/<(?:.|\n)*?>/gm, '');
              effectivenessEntry.multiplier = 4;
            }
            else{
              effectivenessEntry.multiplier = 2;
            }
            types[j] = effectivenessEntry;
            effectivenessJSON.weaknesses = types;
          break;
          case "Resistances":
            if(types[j].includes('<b>')){
              effectivenessEntry.type = types[j].replace(/<(?:.|\n)*?>/gm, '');
              effectivenessEntry.multiplier = 0.25;
            }
            else{
              effectivenessEntry.multiplier = 0.5;
            }
            types[j] = effectivenessEntry;
            effectivenessJSON.resistances = types;
            break;
          case "Immunities":
            effectivenessEntry.multiplier = 0;
            types[j] = effectivenessEntry;
            effectivenessJSON.immunities = types;
          break;
        }
      }
    }
    
    console.log(effectivenessJSON);
    for(var key in _theirTeam){
      if(key == effectivenessJSON.species){
        _theirTeam[key].weaknesses = effectivenessJSON.weaknesses;
        _theirTeam[key].resistances = effectivenessJSON.resistances;
        _theirTeam[key].immunities = effectivenessJSON.immunities;
      }
    }
    _weaknessFound = true;
  }
});

// BATTLING EVENTS //

// A battle challenge from another user has been received.
_client.on('self:challenges', function(event) {
  var user = '';
  for(var key in event.data.challengesFrom){
    if(key != undefined)
      user = key;
  }
  if(user != undefined && user != null && user != ''){
    console.log(user + " would like to battle!");
    _client.send("/accept " + user)
  }
});

// A battle starts.
_client.on('battle:start', function(event) {
  console.log("\n+------------" + event.room);
  _ourTeam = [];
  _theirTeam = [];
  _client.send("gl;hf!", event.room)
  _client.send("/timer on", event.room)
});

// Get player information, learn if we are p1 or p2 in this battle.
_client.on('battle:player', function(event){
  if(event.data.username != undefined){
    if(event.data.username.includes(_creds.username))
      _weAre = event.data.player + 'a';
    else
      _theyAre = event.data.player + 'a';
  }
});

// Get rules for this battle.
_client.on('battle:rule', function(event){
  console.log(JSON.stringify(event.data));
  for(var i = 0; i < event.data.length; i++){
    _rules[i] = event.data[i];
  }
});

// A request is being made of us. We must decide how to respond.
_client.on('battle:request', function(event){
  console.log(event);
  console.log(JSON.stringify(event.data));
  _reqNum = event.data.rqid;
  //console.log("OUR TEAM:")
  for(var i = 0; i < event.data.side.pokemon.length; i++){
    _ourTeam[i] = event.data.side.pokemon[i];
    //console.log(JSON.stringify(_ourTeam[i]));
  }
  // if we have never done a switch, set out active guy to our lead
  if(_ourActiveMon == undefined)
      _ourActiveMon = _ourTeam[0];

  var response = '';
  var forceSwitch = (event.data.forceSwitch != undefined && event.data.forceSwitch.includes(true));

  if(forceSwitch){
    // pick a team member at random until we select one that has not fainted
    do{
      var switchChoice = getRandomInt(0, 5);
      response = '/choose switch ' + (switchChoice+1)  + '|'+ _reqNum;
    }while(_ourTeam[switchChoice].condition.includes('fnt'))
    _client.send(response, event.room)
  }
  else{
    // pick a random move from our move list **OLD CODE**
    //var move = getRandomInt(1, _ourActiveMon.moves.length); 

    //Run algorithm and Make an educated guess on what move to use next
    //PriotizeSuperEffective(currPoke, teamPokes, enemyPoke)
    // Set up a check every 500ms because we are still waiting for additional info to
    // come in via separate commands.
    var waitForSwitch = setInterval(function() {
      //Once the flags are all set, we run the algo
      if(_theirActiveMon != undefined && _weaknessFound) {
        var move = Algorithm.PrioritizeSuperEffective(_ourActiveMon, _ourTeam, _theirActiveMon);
        console.log(move);
        response = '/choose move ' + move + '|' + _reqNum;
        _client.send(response, event.room);
        //Reset flags and clear interval
        _weaknessFound = false;
        clearInterval(waitForSwitch);
      }
    }, 500);
  }
});

// A switch has happened, either through deliberate switch or drag-out.
_client.on('battle:switch', function(event){
  //console.log(JSON.stringify(event.data));
  if(event.data.pokemon.includes(_weAre)){
    console.log("We send out: " + event.data.details + " with " + event.data.hp + "HP");
    // cycle through list to find which of our guys is active
    for(var i = 0; i < _ourTeam.length; i++){
      if(_ourTeam[i].active = true){
        _ourActiveMon = _ourTeam[i];
        break;
      }
    }
  }
  else if(event.data.pokemon.includes(_theyAre)){
    console.log("They send out: " + event.data.details + " with " + event.data.hp  + "HP");
    var monName = event.data.details.split(',')[0];
    var switchedMon = new mon();
    switchedMon.species = monName; // various forms might not report as species (ie rotom-wash might be reportred as just rotom!)
    if(!_theirTeam.includes(switchedMon)){
      _theirTeam[monName] = switchedMon;
       /*  Do database queries for the builds used for this species in Randoms */
      var moves = getPossibleBattleMoves(_theirTeam[monName]);
      console.log("POSSIBLE MOVES:")
      console.log(moves)
      _client.send("/weakness " + monName, event.room)
      /* Make estimates about remaining data fields based on those estimates

        !!! Enemy HP is represented by percentage in the event JSON while your HP is represented normally !!!
    */
    }
  }
  console.log("\nP2 REVEALED TEAM:")
    for(var key in _theirTeam){
      console.log(_theirTeam[key])
  }
  _theirActiveMon = _theirTeam[monName]
  console.log("THEIR ACTIVE MON:")
  console.log(_theirActiveMon);
  //console.log("Team Comp: " + JSON.stringify(event.data.side.pokemon))
});

// A move has been used.
_client.on('battle:move', function(event){
  if(event.data.pokemon.includes(_theyAre)){
    console.log("Opponent used: " + event.data.move + "!");
    var user = parsePokeName(event.data.pokemon);
    //console.log(_theirTeam[user]);
    /*
      we know _theirTeam[user] knows event.data.move, so we can better estimate which build it is using. 
      Re-evaluate estimates here.
    */
  }
});

// Damage has been dealt.
_client.on('battle:damage', function(event){
  console.log('damage')
  console.log(JSON.stringify(event))
  if(event.data.pokemon.includes(_theyAre)){
    // update their hp
    //_theirTeam[parsePokeName(event.data.pokemon)].currentHP =
  }
});

_client.on('battle:item', function(event){
  /*
  console.log('item')
  console.log(JSON.stringify(event))
  if(event.data.pokemon.includes(_theyAre)){
    _theirTeam[parsePokeName(event.data.pokemon)].item = event.data.item;
    console.log( _theirTeam[parsePokeName(event.data.pokemon)].species + " has " +  event.data.item);
  }
  */

});

_client.on('battle:enditem', function(event){
  //console.log('enditem')
  //console.log(JSON.stringify(event))
  //_theirTeam[parsePokeName(event.data.pokemon)].item = 'NONE'
});

_client.on('battle:ability', function(event){
  //console.log(JSON.stringify(event))
});


// The battle has ended, and a winner has been named.
_client.on('battle:win', function(event){
  console.log(event.room + " has ended!")
  if(event.data.includes(_weAre)){
    console.log("We win!")
  }
  _client.send("gg!", event.room);
  _client.send("/leave", event.room);
});

// Print what we're sending
_client.on('internal:send', function(event){
  //console.log(event);
});


// Helper Functions

// parses 'p1a: <SPECIES>' to just '<SPECIES>' 
function parsePokeName(name){
  var splitName = name.split(':')[1].trim();
  return splitName;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//AI Functions

function QueryMove(move) {
  console.log(MoveData[move]);
}

function ParseMoveData(data) {

}

function getPossibleBattleMoves(pokemon) {
  var species = pokemon.species.toLowerCase();
  // need to de-hyphenate the name for lookup 
  // need to compress spaces out of mon name, apparently 
  console.log(species)
  if(BattleFormatsData.BattleFormatsData[species] !== undefined 
     && BattleFormatsData.BattleFormatsData[species].randomBattleMoves !== undefined) {
    return BattleFormatsData.BattleFormatsData[species].randomBattleMoves;
  }
}

function minNode(data) {
  this.data = data;
  this.value = NaN;
  //Based on the given data, calculate the value of the node
  // i.e; damage, heuristics, possibility of switching... etc
  this.CalculateValue = function() {/*TODO*/};
  this.CalculateValue();
  return this;
}

function maxNode(data) {
  this.data = data;
  this.value = NaN;
  //Based on the given data, calculate the value of the node
  // i.e; damage, heuristics, possibility of switching... etc
  this.CalculateValue = function() {/*TODO*/};
  this.CalculateValue();
  return this;
}

var predictionTree = {};

function generatePredictionTree() {
  //This tree will always have 5 nodes (4 battle moves, 1 switch)
  
}

function updatePredictionTree() {
  //if by any chance a move affects the values of future nodes
  //i.e knockout results in player only having one pokemon left 
}

//Pseudocode from Wikipedia
//Ideally, I think alphabeta pruning algo might suit this better 
function minimax(node, depth, maximizingPlayer) {
  //TODO
  if(depth == 0 || node.children == undefined)
    return node.value;
  if(maximizingPlayer) {
    var bestValue = Number.NEGATIVE_INFINITY;
    for(child in node.children) {
      var v = minimax(child, depth - 1, false);
      bestValue = max(bestValue, v);
    }
    return bestValue;
  } else {
    //I guess in this case we do nothing since we don't know
    //what the other player is doing
  }
}

function max(a, b) {
  return (a > b) ? a : b;
}
