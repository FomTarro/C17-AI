var fs = require('fs');

//stops the program if not enough arguments given
if (process.argv.length !== 5) {
    console.error('Exactly two arguments required');
    console.error('node optimize.js <optimization type> <input file>.txt <allowed time>');
    process.exit(1);
}

var _optimizeType = process.argv[2];

var _inputFile = process.argv[3];

var _allowedTime = process.argv[4];

var _input = [];

//convert file to be a array of integers inserted into _input
fs.readFile(_inputFile, 'utf-8', function (err, data){
	if (err) throw err;
	var charInput = data.split(" ");
	charInput.forEach(function(d){
		_input.push(parseInt(d));
	});
	console.log(_input);
	Optimize();
});

var _bin1 = [];
var _bin2 = [];
var _bin3 = [];

function Optimize(){
	
}
