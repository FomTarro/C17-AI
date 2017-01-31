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
    var best = RunGeneticAlgorithm();
	console.log("Total Score: " + best);
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
			_bin1.push(input.slice(randomIndex, randomIndex + 1)[0]);
		}
		else if(_bin2.length < maxBinLength){
			_bin2.push(input.slice(randomIndex, randomIndex + 1)[0]);
		}
		else{
			_bin3.push(input.slice(randomIndex, randomIndex + 1)[0]);
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

//returns total score of bins
function ScoreBins(binList){
	var score = 0;
    var multiplier = 1;
    binList[0].forEach(function(d){
        score += parseInt(d) * multiplier;
        multiplier = multiplier * (-1);
    });
    for(var i = 1; i < binList[1].length; i++){
        if(binList[1][i] > binList[1][i - 1])
            score += 3;
        else if(binList[1] == binList[1][i - 1])
            score += 5;
        else if(binList[1] < binList[1][i - 1])
            score -= 10;
    }
    var half1 = binList[2].slice(0, Math.floor(binList[2].length / 2));
    var half2 = binList[2].slice(Math.ceil(binList[2].length / 2));
    
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
	return score;
}

//returns total score of all bins
function TotalScore(){
	return parseInt(ScoreBin(1)) + parseInt(ScoreBin(2)) + parseInt(ScoreBin(3));
}

function RunGeneticAlgorithm() {

    var probability = GenerateProbability(10);  //1 in 10th -- 0.1 chance of mutating

    function Reproduce(x, y, n, c) {
        //x, y are inputs
        //n = length of x, c = random number from 1 to n
        var sideA1 = x[0].slice(0, c);
        var sideA2 = x[1].slice(0, c);
        var sideA3 = x[2].slice(0, c);
        var sideB1 = y[0].slice(c, n);
        var sideB2 = y[1].slice(c, n);
        var sideB3 = y[2].slice(c, n);
        var c1 = sideA1.concat(sideB1);
        var c2 = sideA2.concat(sideB2);
        var c3 = sideA3.concat(sideB3);
        var child = [c1, c2, c3];
        //if small random probability, then mutate child
        if(RandomRange(0, probability.length) == 0) {
            Mutate(child);
        }
        return child;
    }

    function Select(prevSelected) {
        var random = -1;
        if(prevSelected !== undefined)
            do {
                random = RandomRange(0, population.length - 1);
            } while(population[random] === prevSelected);
        else
            random = RandomRange(0, population.length - 1);
        return population[random];
    }

    function Mutate(item) {
        //TO DO

        return item;
    }

    function GenerateProbability(denom) {
        var bag = [];
        for(var i = 0; i < denom; i++)
            bag.push(i);
        return bag;
    }

    function UpdateScore(newScore) {
        if(newScore > best) {
            best = newScore;
            return true;
        }
        else if(newScore < best && newScore > worst) {
            return true;
        } 
        else if(newScore < worst){
            worst = newScore;
            return false;
        }
    }

    var population = [
        [
            _bin1, _bin2, _bin3
        ]
    ]
   
    var best = ScoreBins(population[0]);
    var worst = best;

    InitializeBins();

    population.push([
        _bin1, _bin2, _bin3
    ])

    var score2 = ScoreBins(population[1]);
    if(score2 > best) { 
        worst = best;
        best = score2;
    }
    else worst = score2;

    var generation = 0;
    while(generation < 2) {
        console.log("Generation " + generation);
        var new_population = [];
        for(var i = 0; i < population.length; i++) {
            //randomly select x
            var x = Select();
            var binLength = x[0].length;
            var cutPoint = RandomRange(1, binLength - 1);
            //randomly select y
            var y = Select(x);
            var childA = Reproduce(x, y, binLength, cutPoint);
            var scoreA = ScoreBins(childA);
            var childB = Reproduce(y, x, binLength, cutPoint);
            var scoreB = ScoreBins(childB);
            //add child to new population
            console.log(childA + ", Score: " + scoreA);
            console.log(childB + ", Score: " + scoreB);
            //Cull worsts
            if(UpdateScore(scoreA)) new_population.push(childA);
            if(UpdateScore(scoreB)) new_population.push(childB);
        }
        console.log(population[0] + " score " + ScoreBins(population[0]));
        console.log(population[1] + " score " + ScoreBins(population[1]));
        population.sort(function(a, b) {
            ScoreBins(a) - ScoreBins(b);
        });
        console.log("Sorted: " + population);
        console.log(population[0] + " score " + ScoreBins(population[0]));
        console.log(population[1] + " score " + ScoreBins(population[1]));
        population = new_population;
        //if an individual is fit enough or x amount of time has elapsed, break
        generation++;
    }
    
    return best;
}

function RandomRange(min, max) {
    if(min > max) return min;
    return Math.floor(Math.random() * (max - min + 1) + min);
}