var _bin1 = [];
var _bin2 = [];
var _bin3 = [];


var fs = require('fs');
var Timer = require('./timer');

var _input = [];

function Optimize(){
	InitializeBins();
	PrintBins(true);
    var best = RunGeneticAlgorithm(5);
    console.log("Total Score: " + best);
    PrintBins(true);
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

//returns total score of all bins
function TotalScore(){
	return parseInt(ScoreBin(1)) + parseInt(ScoreBin(2)) + parseInt(ScoreBin(3));
}

function RunGeneticAlgorithm(startingPop, allowedTime, bins, input) {

    _input = input;

    var mutations = 0;
    var culls = 0;
    var genCulls = 0;
    var topPopLength= 0;
    var generation = 0;
    var StateDictionary = {};
    var hashCutoff = 5;

    var probability = GenerateProbability(2);  //1 in 8 chance of mutating

    var population = [bins];
    var best = ScoreBins(population[0]);
    var worst = best;
    var genWorst = worst;

    StateDictionary[key(bins)] = 1;

    //console.log("Starting Score: " + best);
    /**
     * Populate Gen 0 with states using given # of starting population
     */
    while(population.length < startingPop) {
        var hash = "";
        do {
            InitializeBins();
            hash = key([_bin1, _bin2, _bin3]);
        } while(StateDictionary[hash] != undefined);
        population.push([
            _bin1, _bin2, _bin3
        ]);
        StateDictionary[hash] = 1;
        var newScore = ScoreBins(population[population.length - 1]);
        UpdateScore(newScore, population[population.length - 1]);
    }
    /**
     * Generate children until we reach 12th generation or our score is greater than 38
     */
    var elitismPercentage = 0.1;
    var totalRuntime = 0;
    var deltaTime = 0;
    while(deltaTime < (allowedTime*1000 - totalRuntime)) {
        var timeAtStart = Date.now();
        var new_population = [];
        genCulls = 0;    
        for(var i = 0; i < population.length; i++) {
            //randomly select x
            var x = Select();
            var binLength = x[0].length;
            var cutPoint = RandomRange(1, binLength - 1);
            //randomly select y
            var y = Select(x);
            //Reproduce & score the children
            var childA = Reproduce(x, y, binLength, cutPoint);
            var scoreA = ScoreBins(childA);
            var childB = Reproduce(y, x, binLength, cutPoint);
            var scoreB = ScoreBins(childB);
            //console.log(childA + ", Score: " + scoreA);
            //console.log(childB + ", Score: " + scoreB);
            //add child to new population
            //Cull worsts
            if(UpdateScore(scoreA, childA)) new_population.push(childA);
            if(UpdateScore(scoreB, childB)) new_population.push(childB);
        }
        population.sort(function(a, b) {
            return ScoreBins(b) - ScoreBins(a);
        });
        populationCutoff = Math.floor((population.length * elitismPercentage));
        population = population.slice(0, populationCutoff);

        population = new_population.concat(population);
        population.sort(function(a, b) {
            return ScoreBins(b) - ScoreBins(a);
        });
        populationCutoff = (population.length > 10000) ? 10000 : Math.ceil(population.length);
        population = population.slice(0, populationCutoff);
        //if an individual is fit enough or x amount of time has elapsed, break
        generation++;
        var timeAtEnd = Date.now();
        deltaTime = timeAtEnd - timeAtStart;
        totalRuntime = totalRuntime + deltaTime;
    }
    console.log("Stopped at Generation: " + generation);
    console.log("Culls: " + culls)
    console.log("Top Pool: " + topPopLength);
    console.log("Population: " + population.length);
    console.log("Mutations: " + mutations);
    return [_bin1, _bin2, _bin3];

    /*************************** LOCAL FUNCTIONS USED BY GA ***************************/

    function key(bins) {
        var hash = "";
        bins.forEach(function(row){
            row.forEach(function(value){
                hash += value.toString();
            })
        })
        return hash;
    }

    /**
     * Generates a child given 2 parents and a cut point
     * x - Parent A
     * y - Parent B
     * n - Max length per bin
     * c - Cutpoint
     */
    function Reproduce(x, y, n, c) {
        //x, y are inputs
        //n = length of x, c = random number from 1 to n
        var sideA1 = x[0].slice(0, c);
        var sideA2 = x[1].slice(0, c);
        var sideA3 = x[2].slice(0, c);
        var sideB1 = y[0].slice(c, n);
        var sideB2 = y[1].slice(c, n);
        var sideB3 = y[2].slice(c, n);
        var child = [sideA1.concat(sideB1), sideA2.concat(sideB2), sideA3.concat(sideB3)];
        //check if child has duplicates
        var inputValues = _input.slice(0);
        var missing = [];
        child.forEach(function(row, rowIndex) {
            row.forEach(function(value, colIndex){
                if(inputValues.includes(value)) {
                    inputValues.splice(inputValues.indexOf(value), 1);
                } else {
                    missing.push({row: rowIndex, col: colIndex});
                }
            })
        })

        while(missing.length > 0) {
            var state = missing.shift();
            var random = RandomRange(0, inputValues.length - 1);
            child[state.row][state.col] = inputValues[random];
            inputValues.splice(random, 1);
        }
        //if small random probability, then mutate child
        if(RandomRange(0, probability.length) == 0) {
            Mutate(child);
        }
        return child;
    }

    /**
     * Selects a random state from population.
     * prevSelected - if this parameter is provided, then Select will return a state different from this
     */
    function Select(prevSelected) {
        var random = -1;
        var probability = 0;
        var randomProb = 0;
        if(prevSelected !== undefined) {
            do {
                random = RandomRange(0, population.length - 1);
                probability = (population.length - random) / population.length;
                randomProb = RandomRange(0, 1);
            } while(population[random] === prevSelected && probability > randomProb);
        }
        else {
            do {
                random = RandomRange(0, population.length - 1);
                probability = (population.length - random) / population.length;
                randomProb = RandomRange(0, 1);
            } while(probability > randomProb);
        }
        return population[random];
    }

    /**
     * Mutates the given state
     * Swaps 2 values on from any of the bins
     */
    function Mutate(item) {
        mutations++;
        var x1, y1, x2, y2;
        var bufferSlot;
        do {
            x1 = RandomRange(0, 2);
            y1 = RandomRange(0, item[0].length - 1);
            x2 = RandomRange(0, 2);
            y2 = RandomRange(0, item[0].length - 1);
        } while(!(x1 == x2 && y1 == y2));
        //swap xy_1 and xy_2
        bufferSlot = item[x1][y1];
        item[x1][y1] = item[x2][y2];
        item[x2][y2] = bufferSlot;
        return item;
    }

    /**
     * Generates an array from 0 - denom for probability checking
     */
    function GenerateProbability(denom) {
        var bag = [];
        for(var i = 0; i < denom; i++)
            bag.push(i);
        return bag;
    }

    /**
     * Returns true if given state is better than worst
     *   * Updates the score + bins if better than best
     * Returns false if given state is worse than current worst
     */
    function UpdateScore(newScore, bins) {
        if(StateDictionary[key(bins)] > hashCutoff || StateDictionary[key(bins) == undefined]) {
            return false;
        }
        if(newScore > best) {
            best = newScore;
            _bin1 = bins[0];
            _bin2 = bins[1];
            _bin3 = bins[2];
            //console.log("New Best: " + best + " at gen " + generation);
            //PrintBins(true);        
            if(StateDictionary[key(bins)] == undefined)
                StateDictionary[key(bins)] = 1;
            else
                StateDictionary[key(bins)]++;
            return true;
        }
        else if(newScore <= best && newScore > worst) {
            if(StateDictionary[key(bins)] == undefined)
                StateDictionary[key(bins)] = 1;
            else
                StateDictionary[key(bins)]++;
            return true;
        } 
        else if(newScore <= worst){
            culls++;
            genCulls++;
            worst = newScore;
            return false;
        }
    }
}

/**
 * Returns random int value given a range
 */
function RandomRange(min, max) {
    if(min > max) return min;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = RunGeneticAlgorithm;