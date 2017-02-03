var fs = require('fs');
//var HillClimbing = require('./hill_climbing');
var GeneticAlgorithm = require('./geneticAlgorithm');
//var SimulatedAnnealing = require('./optimizeAnnealing');

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

var theBestScore;
var theTemp = 100;

//convert file to be a array of integers inserted into _input
fs.readFile(_inputFile, 'utf-8', function (err, data){
	if (err) throw err;
	var charInput = data.split(" ");
	charInput.forEach(function(d){
		_input.push(parseInt(d));
	});
	
	//stops the program if the input is not divisible by 9
	if (_input.length % 9 !== 0) {
    	console.error('Number of integers in input file is not divisible by 9');
    	process.exit(1);
	}
	
	console.log(_input);
	Optimize();
});

var _bin1 = [];
var _bin2 = [];
var _bin3 = [];

function Optimize(){
	InitializeBins();
	PrintBins(true);
	var binSet = [_bin1, _bin2, _bin3];
	switch(_optimizeType) {
		case "hill":
			var mostRecentScore = TotalScore();
			HillClimbing(mostRecentScore, _allowedTime, binSet);
			break;
		case "annealing":
			theBestScore = TotalScore();
			SimulatedAnnealing(theBestScore, [_bin1, _bin2, _bin3], theTemp, -9999, _allowedTime * 1000);
			break;
		case "ga":
			binSet = GeneticAlgorithm(50, _allowedTime, binSet, _input);
			break;
	}
	_bin1 = binSet[0];
	_bin2 = binSet[1];
	_bin3 = binSet[2];
	console.log("Total Score: " + TotalScore());
}

//randomly assigns numbers to bins
function InitializeBins(){
	_bin1 = [];
	_bin2 = [];
	_bin3 = [];
	var input = _input;
	var randomIndex;
	var maxBinLength = _input.length / 3;
	
	while(input.length > 0){
		randomIndex = Math.floor(Math.random() * input.length);
		if(_bin1.length < maxBinLength){
			_bin1.push(input.slice(randomIndex, randomIndex + 1));
		}
		else if(_bin2.length < maxBinLength){
			_bin2.push(input.slice(randomIndex, randomIndex + 1));
		}
		else{
			_bin3.push(input.slice(randomIndex, randomIndex + 1));
		}
		
		input = input.slice(0, randomIndex).concat(input.slice(randomIndex + 1));
	}
}

//print bins and their scores if showScores is true
function PrintBins(showScores){
	if(showScores)
		console.log("Bin 1: [" + _bin1 + "] Score: " + ScoreBin(1) +
					"\nBin 2: [" + _bin2 + "] Score: " + ScoreBin(2) +
					"\nBin 3: [" + _bin3 + "] Score: " + ScoreBin(3));
	else
		console.log("Bin 1: [" + _bin1 + 
					"]\nBin 2: [" + _bin2 + 
					"]\nBin 3: [" + _bin3);
}

//returns the score of the given bin
function ScoreBin(binNum){
	var score = 0;
	switch(binNum){
		case 1:
			var multiplier = 1;
			_bin1.forEach(function(d){
				score += parseInt(d) * multiplier;
				multiplier = multiplier * (-1);
			});
			break;
		case 2:
			for(var i = 1; i < _bin2.length; i++){
				if(_bin2[i] > _bin2[i - 1])
					score += 3;
				else if(_bin2[i] == _bin2[i - 1])
					score += 5;
				else if(_bin2[i] < _bin2[i - 1])
					score -= 10;
			}
			break;
		case 3:
			var half1 = _bin3.slice(0, Math.floor(_bin3.length / 2));
			var half2 = _bin3.slice(Math.ceil(_bin3.length / 2));
			
			half1.forEach(function(d){
				if(d == 2 || d == 3 || d == 5 || d == 7)
					score += 4;
				else if(d < 0)
					score -= 2;
				else
					score -= parseInt(d);
			});
			
			half2.forEach(function(d){
				if(d == 2 || d == 3 || d == 5 || d == 7)
					score -= 4;
				else if(d < 0)
					score += 2;
				else
					score += parseInt(d);
			});
			break;
		default:
			console.error("/!\\ Bin " + binNum + " is not a bin!");
			return NaN;
			break;
	}
	return score;
}

//returns total score of all bins
function TotalScore(){
	return parseInt(ScoreBin(1)) + parseInt(ScoreBin(2)) + parseInt(ScoreBin(3));
}

function HillClimbing(currBestScore, allowedTime, bins)
{
	// generate a new set of bins from the same input file
	currBestScore = parseInt(currBestScore);
	
	counter = 0;
	
	for(var i = 0; i < _input.length / 3; i++){
		for(var j = 0; j < 3; j++){
			for(var k = 0; k < _input.length / 3; k++){
				for(var l = 0; l < 3; l++){
					if(i !== k || j !== l){
						targetValue = bins[i][j];
						bins[i][j] = bins[k][l];
						bins[k][l] = targetValue;
						
						
						//PrintBins(true);
						var curr_best_score = 0;
						var new_score = 0;
						new_score = TotalScore();
						//console.log("Last Total Score: " + parseInt(new_score));
						// allow 100 iterations for correct solution
						// if the current score is better than the last one, continue
						if (new_score > currBestScore && counter <= 100)
						{
							curr_best_score = new_score;
							return HillClimbing(parseInt(curr_best_score), allowedTime, bins);
						}
						
						counter++;
						
						bins[k][l] = bins[i][j];
						bins[i][j] = targetValue;
					}
				}
			}
		}
	}
	
	PrintBins(true);
	console.log("Best Solution: " + currBestScore);
	return currBestScore;
}

function SimulatedAnnealing(currBestScore, bins, temperature, prevScore, allowedTime)
{
	if(allowedTime <= 0)
		return -1;
		
	var timeAtStart = Date.now();
	
	currBestScore = parseInt(currBestScore);
	
	//console.log("Best: " + currBestScore);
	
	var i = 0;
	var j = 0;
	var k = 0;
	var l = 0;
	var nodes = [];
	var options = [];
	
	var restart = 0;
	
	for(var a = 0; a < _input.length; a++){
		options.push(a + 1);
	}
	
	while(options.length > 0){
		randomIndex = Math.floor(Math.random() * options.length);
		nodes.push(options.slice(randomIndex, randomIndex + 1));
		options = options.slice(0, randomIndex).concat(options.slice(randomIndex + 1));
	}

	var tryNodes = [];
	var tryOptions = [];

	for (var b = 0; b < _input.length; b++) {
		tryOptions.push(b + 1);
	}

	while (tryOptions.length > 0) {
		randomIndex = Math.floor(Math.random() * tryOptions.length);
		tryNodes.push(tryOptions.slice(randomIndex, randomIndex + 1));
		tryOptions = tryOptions.slice(0, randomIndex).concat(tryOptions.slice(randomIndex + 1));
	}

	while(i == k && j == l){
		i = Math.floor((nodes[Math.floor(Math.random() * 3)] - 1) / (_input.length / 3));
		j = nodes[Math.floor(Math.random() * (_input.length / 3))] % (_input.length / 3);
		k = Math.floor((nodes[Math.floor(Math.random() * 3)] - 1) / (_input.length / 3));
		l = nodes[Math.floor(Math.random() * (_input.length / 3))] % (_input.length / 3);
	}

	targetValue = bins[i][j];
	bins[i][j] = bins[k][l];
	bins[k][l] = targetValue;

	var new_score = 0;
	new_score = TotalScore();

	if (temperature == 0) {
		console.log("Best Solution: " + currBestScore);
		return 0;
	}
	
	//console.log("New Score: " + new_score);

	if (new_score - prevScore > 0) {
		//console.log("Going Up");
		if (new_score > currBestScore) {
			theBestScore = new_score;
			var timeAtEnd = Date.now();
        	var deltaTime = timeAtEnd - timeAtStart;
			restart = SimulatedAnnealing(new_score, bins, temperature, new_score, allowedTime - deltaTime);
		} else {
			var timeAtEnd = Date.now();
        	var deltaTime = timeAtEnd - timeAtStart;
			restart = SimulatedAnnealing(currBestScore, bins, temperature, new_score, allowedTime - deltaTime);
		}
	} else if (Math.exp((new_score - prevScore) / temperature) > Math.random()) {
		//console.log("Going down");
		if (new_score > currBestScore) {
			theBestScore = new_score;
			var timeAtEnd = Date.now();
        	var deltaTime = timeAtEnd - timeAtStart;
			restart = SimulatedAnnealing(new_score, bins, temperature - 1, new_score, allowedTime - deltaTime);
		} else {
			var timeAtEnd = Date.now();
        	var deltaTime = timeAtEnd - timeAtStart;
			restart = SimulatedAnnealing(currBestScore, bins, temperature - 1, new_score, allowedTime - deltaTime);
		}
	}
	
	if(restart == -1)
		return -1;

	if(restart == 1){
		console.log("restart" + temperature);
		console.log("Current Best: " + currBestScore);
		InitializeBins();
		var timeAtEnd = Date.now();
        var deltaTime = timeAtEnd - timeAtStart;
		return SimulatedAnnealing(theBestScore, [_bin1, _bin2, _bin3], temperature, currBestScore, allowedTime - deltaTime);
	}
	
	return 1;

	/*PrintBins(true);
	console.log("Best Solution!!!: " + currBestScore);
	return currBestScore;*/
}
