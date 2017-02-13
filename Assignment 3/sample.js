// import in probability library maybe
// import in network class

//code to read in cli commands

var fs = require('fs');

if (process.argv.length < 5) {
    console.error('Exactly two arguments required');
    console.error('node sample.js <query node> <iterations> <observed node 1> <observed node 2> ...');
    process.exit(1);
}

var _queryNode =  process.argv[2];
var _iterations =  process.argv[3];
var _observedNodes = [];

// accept in all future args as nodes to observe
for(var i = 4; i <  process.argv.length; i++){
    var obs =  process.argv[i]
    _observedNodes[i-4] = obs;
}
