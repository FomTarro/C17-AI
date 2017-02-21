var PokeClient = require("./PokeClient/client");
var mon = require('./mon');
var _client = new PokeClient();
var _selfID = "PokeTron5000"


var _ourTeam = [];
var _theirTeam =[];
var _rules = [];
var _turnNum = 0;

var _ourActiveMon
var _theirActiveMon

// variables for which player in the room is who
var _weAre = ''//'p1a';
var _theyAre = ''//'p2a'; 

_client.connect();

// Websocket has connected.
_client.on('ready', function() {
  _client.login(_selfID, 'cs4341');
});

// Successful login.
_client.on('login', function(event) {
  console.log('Logged in as:', event.data.username);
});

// Login failed.
_client.on('error:login', function(err) {
  console.log('Error encountered while logging in:', err.message);
});

// A message has been recieved from another player
_client.on('chat:private', function(event){
  console.log(event.data.sender.trim() + ": " + event.data.message)
  if(event.data.sender.trim() != _selfID){
     _client.send("/pm" + event.data.sender +  ", <I am a robot designed to play Random Battles!>")
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

// A Battle starts
_client.on('battle:start', function(event) {
  console.log("\n" + event.room);
  _ourTeam = [];
  _theirTeam = [];
  // be polite
  _client.send("gl;hf!", event.room)
  _client.send("/timer on", event.room)
  // give up
  //_client.send("/forfeit", event.room);
  // get out
  //_client.send("/leave", event.room);
});

_client.on('battle:player', function(event){
  //console.log(JSON.stringify(event))
  if(event.data.username != undefined){
    if(event.data.username.includes(_selfID)){
      _weAre = event.data.player + 'a';
    }
    else{
      _theyAre = event.data.player + 'a';
    }
  }
});

_client.on('battle:rule', function(event){
  console.log(JSON.stringify(event.data));
  for(var i = 0; i < event.data.length; i++){
    _rules[i] = event.data[i];
  }
});
// something is being asked 
_client.on('battle:request', function(event){
  //console.log(JSON.stringify(event.data));
  var response = '';
  for(var i = 0; i < event.data.side.pokemon.length; i++){
    _ourTeam[i] = event.data.side.pokemon[i];
    if(_ourActiveMon == undefined){
      _ourActiveMon = _ourTeam[0];
    }
    //console.log(JSON.stringify(_ourTeam[i]));
  }
  _turnNum = event.data.rqid;

  if(event.data.forceSwitch != undefined && event.data.forceSwitch.includes(true)){
    // pick a random guy that isn't fainted.
    do{
      var switchChoice = getRandomInt(0, 5);
      response = '/choose switch ' + (switchChoice+1)  + '|'+ _turnNum + ''
    }while(_ourTeam[switchChoice].condition.includes('fnt'))
  }
  else{
    var move = getRandomInt(1, _ourActiveMon.moves.length); // pick a random move
    // check if _ourActiveMon.item.includes("choice")
    response = '/choose move ' + move + '|' + _turnNum + '';
  }
  console.log(response);
  _client.send(response, event.room)
});

_client.on('battle:switch', function(event){
  //console.log(JSON.stringify(event.data));

  if(event.data.pokemon.includes(_weAre)){
    console.log("We send out: " + event.data.details + " with " + event.data.hp + "HP");
    for(var i = 0; i < _ourTeam.length; i++){
      if(_ourTeam[i].active = true){
        _ourActiveMon = _ourTeam[i];
        break;
      }
    }
  }
  else if(event.data.pokemon.includes(_theyAre)){
    console.log("They send out: " + event.data.details + " with " + event.data.hp  + "HP");
    var monName = parsePokeName(event.data.pokemon);
    var switchedMon = new mon();
    switchedMon.species = monName; // various forms might not report as species (ie rotom-wash might be reportred as just rotom!)
    if(!_theirTeam.includes(switchedMon)){
      _theirTeam[monName] = switchedMon;
       /*  Do database queries for the builds used for this species in Randoms
        Make estimates about remaining data fields based on those estimates

        !!! Enemy HP is represented by percentage in the event JSON while your HP is represented normally !!!
    */
    }
    console.log("\nP2 REVEALED TEAM:")
    for(var key in _theirTeam){
      console.log(_theirTeam[key])
    }
  }
  _theirActiveMon = _theirTeam[monName]
  //console.log("Team Comp: " + JSON.stringify(event.data.side.pokemon))
});

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

_client.on('battle:damage', function(event){
  //console.log("damage!!!")
  //console.log(JSON.stringify(event))
  if(event.data.pokemon.includes(_theyAre)){
    // update their hp
    //_theirTeam[parsePokeName(event.data.pokemon)].currentHP =
  }
});

_client.on('battle:win', function(event){
  console.log(event.room + " over!")
  if(event.data.includes(_weAre)){
    // we are winner! nice!
  }
  _client.send("gg!", event.room);
  _client.send("/leave", event.room);
});

function parsePokeName(name){
  return name.split(' ')[1];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}