// import in probability library maybe
// import in network class
var Network = require("./network");
//code to read in cli commands

var fs = require('fs');
var Network = require("./network");


if (process.argv.length < 4) {
    console.error('Three or more arguments required');
    console.error('node sample.js <query node> <iterations> (<observed node 1> <observed node 2> ...)');
    process.exit(1);
}
console.time("queryTime");
var _queryNode =  nodeParser(process.argv[2].toLowerCase());
var _iterations =  process.argv[3];
var _observedNodes = [];

if(process.argv.length >= 4) {
    // accept in all future args as nodes to observe
    for(var i = 4; i <  process.argv.length; i++){
        var obs =  nodeParser(process.argv[i]);
        _observedNodes[i-4] = obs;
    }
}

// splits along '=' delimiter 
// .node is the node to look at
// .value is the supplied value
function nodeParser(node){
    if(node.indexOf('=') >= 0) {
        var splitNode = node.split('=');


        var returnNode = new Object();
        returnNode.node = splitNode[0];
        returnNode.value = splitNode[1];

        return returnNode;
    }
    else{
        console.error("Improperly formatted node!")
        console.error("should be: 'node=value'")
        process.exit(1);
    }
}

var netWork = new Network();
netWork.Init();

netWork.RejectionSampling(_queryNode,_observedNodes, netWork, _iterations);
console.timeEnd("queryTime");