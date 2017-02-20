var PokeClient = require("./PokeClient/client");
var mon = require('./mon');
var _client = new PokeClient();
var _selfID = "PokeTron5000"


var _ourTeam = [];
var _theirTeam =[];
var _rules = [];

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
    // be polite
    _client.send("gl;hf!", event.room)
    // give up
    //_client.send("/forfeit", event.room);
    // get out
    //_client.send("/leave", event.room);
});

_client.on('battle:player', function(event){
  if(event.data.username.includes(_selfID)){
    _weAre = event.data.player + 'a';
  }
  else{
    _theyAre = event.data.player + 'a';
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
  //console.log("our team:")
  for(var i = 0; i < event.data.side.pokemon.length; i++){
    _ourTeam[i] = event.data.side.pokemon[i];
    console.log(JSON.stringify(_ourTeam[i].details));
  }
});

_client.on('battle:switch', function(event){
  //console.log(JSON.stringify(event.data));

  if(event.data.pokemon.includes(_weAre)){
    console.log("We send out: " + event.data.details + " with " + event.data.hp + "HP");
  }
  else if(event.data.pokemon.includes(_theyAre)){
    console.log("They send out: " + event.data.details + " with " + event.data.hp  + "HP");
    var monName = event.data.details.split(',')[0];
    var switchedMon = new mon();
    switchedMon.species = monName; // various forms might not report as species (ie rotom-wash might be reportred as just rotom!)

    /*  Do database queries for the builds used for this species in Randoms
        Make estimates about remaining data fields based on those estimates

        !!! Enemy HP is represented by percentage in the event JSON while your HP is represented normally !!!
    */

    if(!_theirTeam.includes(switchedMon)){
      _theirTeam[monName] = switchedMon;
    }
    console.log("\nP2 REVEALED TEAM:")
    for(var key in _theirTeam){
      console.log(_theirTeam[key])
    }
  }
  //console.log("Team Comp: " + JSON.stringify(event.data.side.pokemon))
});

_client.on('battle:move', function(event){
  if(event.data.pokemon.includes(_theyAre)){
    console.log("Opponent used: " + event.data.move + "!");
    var user = event.data.pokemon.split(' ')[1];
    //console.log(_theirTeam[user]);
    /*
    we know _theirTeam[user] knows event.data.move, so we can better estimate which build it is using. 
    Re-evaluate estimates here.
    */
  }
});


