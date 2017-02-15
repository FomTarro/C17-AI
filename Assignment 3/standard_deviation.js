

function stdDev(prob_query)
{
	var stdDev = Math.sqrt(prob_query * (1 - prob_query));
	return stdDev;
}

function confidenceInterval(prob_query, stdDev, numSamples)
{
	var lowerRange = prob_query - 2 * (stdDev / sqrt(numSamples));
	var upperRange = prob_query + 2 * (stdDev / sqrt(numSamples));
	var interval = [];

	interval.push(lowerRange);
	interval.push(upperRange);
	return interval;
}
