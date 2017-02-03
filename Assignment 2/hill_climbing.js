
var fs = require('fs');

var _optimizeType = process.argv[2];

var _inputFile = process.argv[3];

var _allowedTime = process.argv[4];

var _input = [];

var counter = 0;

var _bin1 = [];
var _bin2 = [];
var _bin3 = [];

function Optimize(){
	var most_recent_score = 0;
	InitializeBins();
	PrintBins(true);
	most_recent_score = TotalScore();
	console.log("Total Score: " + TotalScore());
	HillClimbing(most_recent_score, [_bin1, _bin2, _bin3]);
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

//returns total score of bins
function ScoreBins(binList){
	var score = 0;
    var multiplier = 1;
    var s1 = 0, s2 = 0, s3 = 0;
    binList[0].forEach(function(d){
        s1 += parseInt(d) * multiplier;
        multiplier = multiplier * (-1);
    });
    for(var i = 1; i < binList[1].length; i++){
        if(binList[1][i] > binList[1][i - 1])
            s2 += 3;
        else if(binList[1][i] == binList[1][i - 1])
            s2 += 5;
        else if(binList[1][i] < binList[1][i - 1])
            s2 -= 10;
    }
    var half1 = binList[2].slice(0, Math.floor(binList[2].length / 2));
    var half2 = binList[2].slice(Math.ceil(binList[2].length / 2));
    
    half1.forEach(function(d){
        if(d == 2 || d == 3 || d == 5 || d == 7)
            s3 += 4;
        else if(d < 0)
            s3 -= 2;
        else
            s3 -= parseInt(d);
    });
    
    half2.forEach(function(d){
        if(d == 2 || d == 3 || d == 5 || d == 7)
            s3 -= 4;
        else if(d < 0)
            s3 += 2;
        else
            s3 += parseInt(d);
    });
	return s1 + s2 + s3;
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
	totalScore = parseInt(ScoreBin(1)) + parseInt(ScoreBin(2)) + parseInt(ScoreBin(3));
	return parseInt(totalScore);
}

var totalRuntime = 0;
var deltaTime = 0;
function HillClimbing(currBestScore, allowedTime, bins, input)
{
	var timeAtStart = Date.now();
	if((allowedTime > 0)) {
		return curr_best_score;
	}
	_bin1 = bins[0];
	_bin2 = bins[1];
	_bin3 = bins[2];
	_input = input;
	// generate a new set of bins from the same input file
	currBestScore = parseInt(currBestScore);
	counter = 0;
	console.log("Date: " + timeAtStart);
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

						new_score = ScoreBins(bins);
						//console.log("Last Total Score: " + parseInt(new_score));
						// allow 100 iterations for correct solution
						// if the current score is better than the last one, continue
						if (new_score > currBestScore && counter <= 100) {
							curr_best_score = new_score;			
							var timeAtEnd = Date.now();
							deltaTime = timeAtEnd - timeAtStart;
							totalRuntime = totalRuntime + deltaTime;
							return HillClimbing(parseInt(curr_best_score), (allowedTime - deltaTime), bins, _input);
						} else {
							InitializeBins();
							var initScore = TotalScore();
							return HillClimbing(parseInt(initScore), (allowedTime - deltaTime), bins, _input);	
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

module.exports = HillClimbing;