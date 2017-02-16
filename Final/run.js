var PokeClient = require("./PokeClient/client");
var client = new PokeClient();
var selfID = "PokeTron5000"

client.connect();

// Websocket has connected.
client.on('ready', function() {
  client.login(selfID, 'cs4341');
});

// Successful login.
client.on('login', function(event) {
  console.log('Logged in as:', event.data.username);
});

// Login failed.
client.on('error:login', function(err) {
  console.log('Error encountered while logging in:', err.message);
});

// A message has been recieved from another player
client.on('chat:private', function(event){
  console.log(event.data.sender.trim() + ": " + event.data.message)
  if(event.data.sender.trim() != selfID){
     client.send("/pm" + event.data.sender +  ", <I AM A ROBOT>")
  }
});

// BATTLING EVENTS //

// A battle challenge from another user has been received.
client.on('self:challenges', function(event) {
  var user = '';
  for(var key in event.data.challengesFrom){
    if(key != undefined)
      user = key;
  }
  if(user != undefined && user != null && user != ''){
    console.log(user + " would like to battle!");
    client.send("/accept " + user)
  }
});

// A room has been joined. It might be a battle!
client.on('room:joined', function(event) {
  //console.log(JSON.stringify(event));
  console.log("--------------------------");
  if(event.data == 'battle'){
    // be polite
    client.send("GG!", event.room)
    // give up
    client.send("/forfeit", event.room);
    // get out
    client.send("/leave", event.room);
  }
});

// something is being asked 
client.on('battle:request', function(event){
  //console.log(JSON.stringify(event.data));
  console.log("our team:")
  for(var i = 0; i < event.data.side.pokemon.length; i++){
    console.log(JSON.stringify(event.data.side.pokemon[i].details))
  }
});

client.on('battle:switch', function(event){
  //console.log(JSON.stringify(event.data));
  if(event.data.pokemon.includes('p1a')){
    console.log("P1 sends out: " + event.data.details + " with " + event.data.hp + "HP");
  }
  else if(event.data.pokemon.includes('p2a')){
    console.log("P2 sends out: " + event.data.details + " with " + event.data.hp  + "HP");
  }
  //console.log("Team Comp: " + JSON.stringify(event.data.side.pokemon))
});

