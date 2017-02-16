var PokeClient = require("./PokeClient/client");
var mon = require('./mon');
var _client = new PokeClient();
var _selfID = "PokeTron5000"

var _ourTeam = [];
var _theirTeam =[];
var _rules = [];

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
     _client.send("/pm" + event.data.sender +  ", <I AM A ROBOT>")
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

// A room has been joined. It might be a battle!
_client.on('room:joined', function(event) {
  //console.log(JSON.stringify(event));
  console.log("----- " + event.room);
  if(event.data == 'battle'){
    // be polite
    _client.send("gl;hf!", event.room)
    // give up
    //_client.send("/forfeit", event.room);
    // get out
    //_client.send("/leave", event.room);
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
  console.log(JSON.stringify(event.data));
  //console.log("our team:")
  for(var i = 0; i < event.data.side.pokemon.length; i++){
    _ourTeam[i] = event.data.side.pokemon[i];
    console.log(JSON.stringify(_ourTeam[i].details));
  }
});

_client.on('battle:switch', function(event){
  //console.log(JSON.stringify(event.data));
  if(event.data.pokemon.includes('p1a')){
    console.log("P1 sends out: " + event.data.details + " with " + event.data.hp + "HP");
  }
  else if(event.data.pokemon.includes('p2a')){
    console.log("P2 sends out: " + event.data.details + " with " + event.data.hp  + "HP");
    if(!_theirTeam.includes(event.data.pokemon)){
      _theirTeam.push(event.data.pokemon);
    }
  }
  console.log("their team:")
   for(var i = 0; i < _theirTeam.length; i++){
    console.log(JSON.stringify(_theirTeam[i]))
  }
  //console.log("Team Comp: " + JSON.stringify(event.data.side.pokemon))
});

