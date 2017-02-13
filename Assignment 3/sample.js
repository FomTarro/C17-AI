// import in probability library maybe
// import in network class

//code to read in cli commands

var fs = require('fs');
var Network = require("./network");


if (process.argv.length < 5) {
    console.error('Exactly two arguments required');
    console.error('node sample.js <query node> <iterations> <observed node 1> <observed node 2> ...');
    process.exit(1);
}

var _queryNode =  nodeParser(process.argv[2]);
var _iterations =  process.argv[3];
var _observedNodes = [];

// accept in all future args as nodes to observe
for(var i = 4; i <  process.argv.length; i++){
    var obs =  nodeParser(process.argv[i]);
    _observedNodes[i-4] = obs;
}

// splits along '=' delimiter 
// .node is the node to look at
// .value is the supplied value
function nodeParser(node){

    var splitNode = node.split('=');

    var returnNode = new Object();
    returnNode.node = splitNode[0];
    returnNode.value = splitNode[1];

    return returnNode;
}

var test = nodeParser("aaa=bbb");
console.log(test.value);