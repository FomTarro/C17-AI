///make the network here
// feel free to rename shit if variables seem too vague

var valid_samples = 0;

/**
 * Node Class
 *  name        name of node
 *  children    an array of children. if node is a leaf, then this is undefined
 *  parents		an array of parents. if node is a top node, then this is undefined
 *  CPT         CPT function. Has different params depending on node.
 *              example for Snow node: - node.CPT(true, CPT.Humidity.LOW, CPT.Temperature.MILD) 
 */
function Node(name, cpt, children, parents, value) {
    this.name = name;
    this.children = children;
    this.parents = parents;
    this.CPT = cpt;
    this.value = value;
    return this;
}

/**
*/
function traverse()
{

}

/** Rejection Sampling
*  increments the number of valid samples if the observed nodes are valid
*  and it is valid
*/
function RejectionSampling(queryNode, observedNodes, network, iterations) {
	// generate a random variable to compare to
	var rand = Math.random();
	
	var hum = -1;
	var tem = -1;
	var da = -1;
	var ice = -1;
	var sno = -1;
	var clo = -1;
	var exa = -1;
	var str = -1;
	
	var samples = 0;
	var accepted = 0;
	
	var reject = false;
	
	for(var itr = 0; itr < iterations; itr++){
		rand = Math.random();
		reject = false;
		
		//collect the samples, this is the probability of all the observed nodes separated by logical ands
		//first we need to determine the values of observed nodes that are the top nodes
		for(var j = 0; j < observedNodes.length; j++){		
			//find the value for top level nodes
			for(var i = 0; i < 3; i++){
	            if(network.topNodes[i].name.toLowerCase() == observedNodes[j].node){
					if (i == 0)
						hum = network.topNodes[i].CPT.QueryValue(observedNodes[j].value.toLowerCase());
					else if (i == 1)
						tem = network.topNodes[i].CPT.QueryValue(observedNodes[j].value.toLowerCase());
					else if (i == 2)
						da = network.topNodes[i].CPT.QueryValue(observedNodes[j].value.toLowerCase());
	            }
	        }
		}
		
		//next we simulate the values of the top nodes we do not know
		for(var i = 0; i < 3; i++){     
			if (i == 0 && hum == -1)
				hum = network.topNodes[i].CPT.SimulateValue(Math.random());
			else if (i == 1 && tem == -1)
				tem = network.topNodes[i].CPT.SimulateValue(Math.random());
			else if (i == 2 && da == -1)
				da = network.topNodes[i].CPT.SimulateValue(Math.random());
	    }
		
		//now we need to determine the values of observed nodes that are icy or snow
		for(var j = 0; j < observedNodes.length; j++){		
			//find the value for top level nodes
			for(var i = 0; i < 2; i++){
				if (i == 0 && hum == -1)
					ice = network.topNodes[0].children[i].CPT.SimulateValue(Math.random(), hum, tem);
				else if (i == 1 && tem == -1)
					sno = network.topNodes[0].children[i].CPT.SimulateValue(Math.random(), hum, tem);
			}
		}

		/*for(var i = 0; i < 3 && !reject; i++){
			//console.log(network.topNodes[i].name.toLowerCase() + == queryNode.node)
			if(network.topNodes[i].name.toLowerCase() == queryNode.node){
				if(rand >= network.topNodes[i].CPT.QueryValue(queryNode.value.toLowerCase())){
					reject = true;
				}
				else{
					if(i == 0)
						hum = network.topNodes[i].CPT.QueryValue(queryNode.value.toLowerCase());
					else if(i == 1)
						tem = network.topNodes[i].CPT.QueryValue(queryNode.value.toLowerCase());
					else if(i == 1)
						da = network.topNodes[i].CPT.QueryValue(queryNode.value.toLowerCase());
					
					samples++;
				}
			}
		}
		rand = Math.random();
		for(var i = 0; i < 2 && !reject; i++){
			if(network.topNodes[0].children[i].name.toLowerCase() == queryNode.node){
				if(rand >= network.topNodes[0].children[i].CPT.QueryValue(queryNode.value.toLowerCase(), hum, tem)){
					//console.log("reject query");
					reject = true;
				}
				else{
					samples++;
				}
			}
		}
		
		for(var j = 0; j < observedNodes.length && !reject; j++){
	        rand = Math.random();
	        for(var i = 0; i < 3 && !reject; i++){
	            if(network.topNodes[i].name.toLowerCase() == observedNodes[j].node){
	                if(rand >= network.topNodes[i].CPT.QueryValue(observedNodes[j].value.toLowerCase())){
	                    reject = true;
	                }
	                else{
						if(i == 0)
							hum = network.topNodes[i].CPT.QueryValue(observedNodes[j].value.toLowerCase());
						else if(i == 1)
							tem = network.topNodes[i].CPT.QueryValue(observedNodes[j].value.toLowerCase());
						else if(i == 1)
							da = network.topNodes[i].CPT.QueryValue(observedNodes[j].value.toLowerCase());
						accepted++;
					}
	            }
	        }
	        rand = Math.random();
			for(var i = 0; i < 2 && !reject; i++){
				if(network.topNodes[0].children[i].name.toLowerCase() == observedNodes[j].node){
					if(rand >= network.topNodes[0].children[i].CPT.QueryValue(observedNodes[j].value.toLowerCase(), hum, tem)){
						//console.log("reject query: " + rand +"stuff: " + network.topNodes[0].children[i].CPT.QueryValue(observedNodes[j].value.toLowerCase(), hum, tem));
						reject = true;
					}
					else{
						accepted++;
					}
				}
			}
	    }*/
	}
	
	console.log("Samples: " + samples);	
	console.log("Accepted Samples: " + accepted);
	console.log("Probability: " + ((accepted/samples)/(samples/iterations)));
}

/**
 * Network Class
 *  This class is the only class that gets exported to sample.js
 *  Other classes must be referenced from Network in order to be seen by outside js files
 * 
 *  topNodes        nodes at the "top" of network. these nodes have no parents.
 *                  if this is undefined, then check if Init has been called
 *  Init            initializes the network. must be called to perform operations on graph
 *  PrintNetwork    Prints network
 */
function Network() {
    this.topNodes;

    this.Init = function() {
        //init bottom-up
        var stressNode = new Node("Stress", CPT.Stress);
        var examsNode = new Node("Exams", CPT.Exams, [stressNode]);
        var cloudyNode = new Node("Cloudy", CPT.Cloudy);
        var dayNode = new Node("Day", CPT.Day, [examsNode]);
        var snowNode = new Node("Snow", CPT.Snow, [cloudyNode, stressNode, examsNode]);
        var icyNode = new Node("Icy", CPT.Icy);
        var humidNode = new Node("Humidity", CPT.Humidity, [icyNode, snowNode]);
        var tempNode = new Node("Temperature", CPT.Temperature, [icyNode, snowNode]);

        this.topNodes = [humidNode, tempNode, dayNode];
    }
	
	this.RejectionSampling = RejectionSampling;
	
    //Prints in level order
    this.PrintNetwork = function() {
        var nodelevel = 0;
        if(this.topNodes == undefined || this.topNodes.length == 0) {
            console.log("Network not initialized");
            return;
        }

        var PrintNodesRecursively = function(node, level) {
            console.log('  '.repeat(level) + node.name);
            if(node.children == undefined) return;
            node.children.forEach(function(child) {
                PrintNodesRecursively(child, level + 1);
            })
        }

        this.topNodes.forEach(function(node) {
            PrintNodesRecursively(node, nodelevel);
        })
    }

    return this;
}

/**
 * CPT Object
 *  This is where we get probability numbers.
 *  Functions are assigned to nodes in Init.  
 * 
 */
var CPT = {

    // Humidity (LOW, MEDIUM, HIGH)
    Humidity: {
        LOW: 0.2,
        MEDIUM: 0.5,
        HIGH: 0.3,
        QueryValue: function(value){
        	if(value == "low")
        		return 0.2
        	if(value == "medium")
        		return 0.5
        	if(value == "high")
        		return 0.3
        }
    },

    // Temperature (WARM, MILD, COLD)
    Temperature: {
        WARM: 0.1,
        MILD: 0.4,
        COLD: 0.5,
        QueryValue: function(value){
        	if(value == "warm")
        		return 0.1
        	if(value == "mild")
        		return 0.4
        	if(value == "cold")
        		return 0.5
        }
    },

    // Day (WEEKDAY, WEEKEND)
    Day: {
        WEEKEND: 0.2,
        WEEKDAY: 0.8,
        QueryValue: function(value){
            if(value == "weekend")
                return 0.2
            if(value == "weekday")
                return 0.8
        }
    },

    // Cloudy (true, false)
    Cloudy: function(isCloudy) {
        return isCloudy ? 0.9 : 0.3;
    },

    // Icy (true, false)
    //      depends on [Humidity, Temperature]
    Icy: {
    	QueryValue: function(isIcy, h, t) {
	        if (isIcy == "true") {
	        	if(h + t == -2) return 0.657;
	        	if(h == -1){
	        		if (t == CPT.Temperature.WARM) return 0.007;
		            if (t == CPT.Temperature.MILD) return 0.05;
		            if (t == CPT.Temperature.COLD) return 0.6;
	        	}
	        	if(t == -1){
	        		if (h == CPT.Humidity.LOW) return 0.061;
		            if (h == CPT.Humidity.MEDIUM) return 0.231;
		            if (h == CPT.Humidity.HIGH) return 0.365;
	        	}
	            if (h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) return 0.001;
	            if (h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) return 0.01;
	            if (h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) return 0.05;
	            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) return 0.001;
	            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) return 0.03;
	            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) return 0.2;
	            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) return 0.005;
	            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) return 0.01;
	            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) return 0.35;
	        } else {
	        	if(h + t == -2){
	        		return 0.927;
	        	}
	            if (h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) return 1 - 0.001;
	            if (h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) return 1 - 0.01;
	            if (h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) return 1 - 0.05;
	            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) return 1 - 0.001;
	            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) return 1 - 0.03;
	            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) return 1 - 0.02;
	            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) return 1 - 0.005;
	            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) return 1 - 0.01;
	            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) return 1 - 0.35;
	        }
    	}
    },

    // Snow (true, false)
    //      depends on [Humidity, Temperature]
    Snow: function(isSnow, h, t) {
        if (isSnow) {
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) return 0.00001;
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) return 0.001;
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) return 0.01;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) return 0.00001;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) return 0.0001;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) return 0.25;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) return 0.0001;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) return 0.001;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) return 0.4;
        } else {
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) return 1 - 0.00001;
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) return 1 - 0.001;
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) return 1 - 0.01;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) return 1 - 0.00001;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) return 1 - 0.0001;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) return 1 - 0.25;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) return 1 - 0.0001;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) return 1 - 0.001;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) return 1 - 0.4;
        }
    },

    // Exams (true, false)
    //      depends on [Snow, Day]
    Exams: function(isTrue, isSnow, day) {
        if (isTrue) {
            if (!isSnow && day == CPT.Day.WEEKEND) return 0.001;
            if (!isSnow && day == CPT.Day.WEEKDAY) return 0.01;
            if (isSnow && day == CPT.Day.WEEKEND) return 0.0001;
            if (isSnow && day == CPT.Day.WEEKDAY) return 0.3;
        } else {
            if (!isSnow && day == CPT.Day.WEEKEND) return 1 - 0.001;
            if (!isSnow && day == CPT.Day.WEEKDAY) return 1 - 0.01;
            if (isSnow && day == CPT.Day.WEEKEND) return 1 - 0.0001;
            if (isSnow && day == CPT.Day.WEEKDAY) return 1 - 0.3;
        }
    },

    // Stress (high/true, low/false)
    //      depends on [Snow, Exams]
    Stress: function(isHigh, isSnow, isExams) {
        if (isHigh) {
            if(!isSnow && !isExams) return 0.01;
            if(!isSnow && isExams) return 0.2;
            if(isSnow && !isExams) return 0.1;
            if(isSnow && isExams) return 0.5;
        } else {
            if(!isSnow && !isExams) return 1 - 0.01;
            if(!isSnow && isExams) return 1 - 0.2;
            if(isSnow && !isExams) return 1 - 0.1;
            if(isSnow && isExams) return 1 - 0.5;
        }
    }
}

module.exports = Network; 