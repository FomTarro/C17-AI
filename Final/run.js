var PokeClient = require("./PokeClient/client");

var client = new PokeClient();

client.connect();

// Websocket has connected.
client.on('ready', function() {
  client.login('PokeTron5000', 'cs4341');
});

// Successful login.
client.on('login', function(user) {
  console.log('Logged in as:', user);
});

// A battle challenge from another user has been received.
client.on('challenge', function(user) {
  console.log(user, 'would like to battle!');
});

// Login failed.
client.on('error:login', function(err) {
  console.log('Error encountered while logging in:', err.message);
});