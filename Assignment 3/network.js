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
	
	var hum_val = -1;
	var tem_val = -1;
	var da_val = -1;
	var ice_val = -1;
	var sno_val = -1;
	var clo_val = -1;
	var exa_val = -1;
	var str_val = -1;
	
	var samples = 0;
	var accepted = 0;
	
	var reject = false;
	
	for(var itr = 0; itr < iterations; itr++){
		rand = Math.random();
		reject = false;
		
		hum = -1;
		tem = -1;
		da = -1;
		ice = -1;
		sno = -1;
		clo = -1;
		exa = -1;
		str = -1;
		
		hum_val = -1;
		tem_val = -1;
		da_val = -1;
		ice_val = -1;
		sno_val = -1;
		clo_val = -1;
		exa_val = -1;
		str_val = -1;
		
		//collect the samples, this is the probability of all the observed nodes separated by logical ands
		
		//next we simulate the values of the top nodes we do not know
		for(var i = 0; i < 3; i++){     
			if (i == 0 && hum == -1)
				hum = network.topNodes[i].CPT.SimulateValue(Math.random());
			else if (i == 1 && tem == -1)
				tem = network.topNodes[i].CPT.SimulateValue(Math.random());
			else if (i == 2 && da == -1)
				da = network.topNodes[i].CPT.SimulateValue(Math.random());
	    }
	    
	    hum_val = network.topNodes[0].CPT.QueryValue(hum);
	    tem_val = network.topNodes[1].CPT.QueryValue(tem);
	    da_val = network.topNodes[2].CPT.QueryValue(da);
		
		//now we need to simulate the unknown icy or snow nodes		
		for (var i = 0; i < 2; i++) {
			if (i == 0 && ice == -1)
				ice = network.topNodes[0].children[i].CPT.SimulateValue(Math.random(), hum_val, tem_val);
			else if (i == 1 && sno == -1)
				sno = network.topNodes[0].children[i].CPT.SimulateValue(Math.random(), hum_val, tem_val);
		}
		
		ice_val = network.topNodes[0].children[0].CPT.QueryValue(ice, hum_val, tem_val);
		sno_val = network.topNodes[0].children[1].CPT.QueryValue(sno, hum_val, tem_val);
		
		//now we need to simulate the unknown cloudy or exam nodes		
		for (var i = 0; i < 3; i++) {
			if (i == 0 && clo == -1)
				clo = network.topNodes[0].children[1].children[i].CPT.SimulateValue(Math.random(), sno);
			else if (i == 2 && exa == -1)
				exa = network.topNodes[0].children[1].children[i].CPT.SimulateValue(Math.random(), sno, da_val);
		}
		
		clo_val = network.topNodes[0].children[1].children[0].CPT.QueryValue(clo, sno);
		exa_val = network.topNodes[0].children[1].children[2].CPT.QueryValue(clo, sno, da_val);
		
		//now we need to simulate the unknown stressed	
		if (str == -1)
			str = network.topNodes[0].children[1].children[1].CPT.SimulateValue(Math.random(), sno, exa);
			
		str_val = network.topNodes[0].children[1].children[1].CPT.QueryValue(clo, sno, exa);
		
		//all values simulated
		for(var j = 0; j < observedNodes.length && !reject; j++){
			if(observedNodes[j].node.toLowerCase() == "humidity"){
				if(observedNodes[j].value.toLowerCase() == hum)
					samples += 0;
				else
					reject = true;
			}
			else if(observedNodes[j].node.toLowerCase() == "temperature"){
				if(observedNodes[j].value.toLowerCase() == tem)
					samples += 0;
				else
					reject = true;
			}
			else if(observedNodes[j].node.toLowerCase() == "day"){
				if(observedNodes[j].value.toLowerCase() == da)
					samples += 0;
				else
					reject = true;
			}
			else if(observedNodes[j].node.toLowerCase() == "icy"){
				if(observedNodes[j].value.toLowerCase() == ice)
					samples += 0;
				else
					reject = true;
			}
			else if(observedNodes[j].node.toLowerCase() == "snow"){
				if(observedNodes[j].value.toLowerCase() == sno)
					samples += 0;
				else
					reject = true;
			}
			else if(observedNodes[j].node.toLowerCase() == "cloudy"){
				if(observedNodes[j].value.toLowerCase() == clo)
					samples += 0;
				else
					reject = true;
			}
			else if(observedNodes[j].node.toLowerCase() == "exams"){
				if(observedNodes[j].value.toLowerCase() == exa)
					samples += 0;
				else
					reject = true;
			}
			else if(observedNodes[j].node.toLowerCase() == "stress"){
				if(observedNodes[j].value.toLowerCase() == str)
					samples += 0;
				else
					reject = true;
			}
		}
		
		//if the sample has not been rejected
		if(!reject){
			samples++;
			if(queryNode.node.toLowerCase() == "humidity"){
				if(queryNode.value.toLowerCase() == hum)
					accepted++;
			}
			else if(queryNode.node.toLowerCase() == "temperature"){
				if(queryNode.value.toLowerCase() == ice)
					accepted++;
			}
			else if(queryNode.node.toLowerCase() == "day"){
				if(queryNode.value.toLowerCase() == da)
					accepted++;
			}
			else if(queryNode.node.toLowerCase() == "icy"){
				if(queryNode.value.toLowerCase() == ice)
					accepted++;
			}
			else if(queryNode.node.toLowerCase() == "snow"){
				if(queryNode.value.toLowerCase() == sno)
					accepted++;
			}
			else if(queryNode.node.toLowerCase() == "cloudy"){
				if(queryNode.value.toLowerCase() == clo)
					accepted++;
			}
			else if(queryNode.node.toLowerCase() == "exams"){
				if(queryNode.value.toLowerCase() == exa)
					accepted++;
			}
			else if(queryNode.node.toLowerCase() == "stress"){
				if(queryNode.value.toLowerCase() == str)
					accepted++;
			}
		}
	}
	
	/*console.log("Humidity: " + hum + " = " + hum_val);
	console.log("Temperature: " + tem + " = " + tem_val);
	console.log("Day: " + da + " = " + da_val);
	console.log("Icy: " + ice + " = " + ice_val);
	console.log("Snow: " + sno + " = " + sno_val);
	console.log("Exam: " + exa + " = " + exa_val);
	console.log("Cloudy: " + clo + " = " + clo_val);
	console.log("Stress: " + str + " = " + str_val);*/
	
	console.log("Samples: " + samples);	
	console.log("Accepted Samples: " + accepted);
	
	if(observedNodes.length > 0)
		console.log("Probability: " + ((accepted/samples)));
	else
		console.log("Probability: " + ((accepted/iterations)));
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
		SimulateValue: function(value) {
			//returns a name
			if (value >= 0 && value < 0.2) return "low";
			if (value >= 0.2 && value < 0.7) return "medium";
			if (value >= 0.7 && value <= 1) return "high";
		},
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
		SimulateValue: function(value) {
			//returns a name
			if (value >= 0 && value < 0.1) return "warm";
			if (value >= 0.1 && value < 0.5) return "mild";
			if (value >= 0.5 && value <= 1) return "cold";
		},
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
		SimulateValue: function(value) {
			//returns a name
			if (value >= 0 && value < 0.2) return "weekend";
			if (value >= 0.2 && value <= 1) return "weekday";
		},
        QueryValue: function(value){
            if(value == "weekend")
                return 0.2
            if(value == "weekday")
                return 0.8
        }
    },

    // Cloudy (true, false)
    Cloudy: {
		SimulateValue: function(value, isSnow) {
			if (isSnow == "true") {
				if (value >= 0 && value < 0.9) return "true";
				if (value >= 0.9 && value <= 1) return "false";
			}
			else if (isSnow == "false") {
				if (value >= 0 && value < 0.3) return "true";
				if (value >= 0.3 && value <= 1) return "false";
			} else {
				new Error("CPT.Cloudy: Unable to SimulateValue");
			}
		},
		QueryValue: function(isCloudy, isSnow) {
			if(isCloudy == "true") {
				if(isSnow == -1) return 0.3 + 0.9;
				if(isSnow == "true" || isSnow) return 0.9;
				if(isSnow == "false" || !isSnow) return 0.3;
			} else {
				if(isSnow == -1) return 0.7 + 0.1;
				if(isSnow == "true" || isSnow) return 0.1;
				if(isSnow == "false" || !isSnow) return 0.7;
			}
    	}
	},

    // Icy (true, false)
    //      depends on [Humidity, Temperature]
    Icy: {
		SimulateValue: function(value, h, t) {
			if(h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) {
				if (value >= 0 && value < 0.001) return "true";
				if (value >= 0.001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) {
				if (value >= 0 && value < 0.01) return "true";
				if (value >= 0.01 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) {
				if (value >= 0 && value < 0.05) return "true";
				if (value >= 0.05 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) {
				if (value >= 0 && value < 0.001) return "true";
				if (value >= 0.001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) {
				if (value >= 0 && value < 0.03) return "true";
				if (value >= 0.03 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) {
				if (value >= 0 && value < 0.2) return "true";
				if (value >= 0.2 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) {
				if (value >= 0 && value < 0.005) return "true";
				if (value >= 0.005 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) {
				if (value >= 0 && value < 0.01) return "true";
				if (value >= 0.01 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) {
				if (value >= 0 && value < 0.35) return "true";
				if (value >= 0.35 && value <= 1) return "false";
			}
		},
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
	        	if(h + t == -2) return 8.343;
	        	if (h == -1) {
					if (t == CPT.Temperature.WARM) return 2.993;
					if (t == CPT.Temperature.MILD) return 2.95;
					if (t == CPT.Temperature.COLD) return 2.4;
				}
				if (t == -1) {
					if (h == CPT.Humidity.LOW) return 2.939;
		            if (h == CPT.Humidity.MEDIUM) return 2.769;
		            if (h == CPT.Humidity.HIGH) return 2.635;
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
    Snow: {
		SimulateValue: function(value, h, t) {
			if(h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) {
				if (value >= 0 && value < 0.0001) return "true";
				if (value >= 0.00001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) {
				if (value >= 0 && value < 0.001) return "true";
				if (value >= 0.001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) {
				if (value >= 0 && value < 0.1) return "true";
				if (value >= 0.1 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) {
				if (value >= 0 && value < 0.0001) return "true";
				if (value >= 0.00001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) {
				if (value >= 0 && value < 0.0001) return "true";
				if (value >= 0.0001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) {
				if (value >= 0 && value < 0.25) return "true";
				if (value >= 0.25 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) {
				if (value >= 0 && value < 0.0001) return "true";
				if (value >= 0.0001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) {
				if (value >= 0 && value < 0.001) return "true";
				if (value >= 0.001 && value <= 1) return "false";
			}
			if(h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) {
				if (value >= 0 && value < 0.4) return "true";
				if (value >= 0.4 && value <= 1) return "false";
			}
		},
		QueryValue: function(isSnow, h, t) {
        	if (isSnow == "true") {
				if(h + t == -2) return 0.75222;
	        	if(h == -1){
	        		if (t == CPT.Temperature.WARM) return 0.00012;
		            if (t == CPT.Temperature.MILD) return 0.0021;
		            if (t == CPT.Temperature.COLD) return 0.75;
	        	}
	        	if(t == -1){
	        		if (h == CPT.Humidity.LOW) return 0.10101;
		            if (h == CPT.Humidity.MEDIUM) return 0.25011;
		            if (h == CPT.Humidity.HIGH) return 0.4011;
	        	}
				if (h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) return 0.0001;
				if (h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) return 0.001;
				if (h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) return 0.01;
				if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) return 0.0001;
				if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) return 0.0001;
				if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) return 0.25;
				if (h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) return 0.0001;
				if (h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) return 0.001;
				if (h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) return 0.4;
			} else {
				if(h + t == -2) return 8.24778;
	        	if(h == -1){
	        		if (t == CPT.Temperature.WARM) return 2.99988;
		            if (t == CPT.Temperature.MILD) return 2.9979;
		            if (t == CPT.Temperature.COLD) return 2.25;
	        	}
	        	if(t == -1){
	        		if (h == CPT.Humidity.LOW) return 2.89899;
		            if (h == CPT.Humidity.MEDIUM) return 2.74989;
		            if (h == CPT.Humidity.HIGH) return 2.5989;
	        	}
				if (h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) return 1 - 0.0001;
				if (h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) return 1 - 0.001;
				if (h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) return 1 - 0.01;
				if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) return 1 - 0.0001;
				if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) return 1 - 0.0001;
				if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) return 1 - 0.25;
				if (h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) return 1 - 0.0001;
				if (h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) return 1 - 0.001;
				if (h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) return 1 - 0.4;
			}
		}
	},
	// Exams (true, false)
	//      depends on [Snow, Day]
	Exams: {
		SimulateValue: function(value, isSnow, day) {
			if(isSnow == "false" || !isSnow && day == CPT.Day.WEEKEND) {
				if(value >= 0 && value < 0.001) return "true";
				if(value >= 0.001 && value <= 1) return "false";
			}
			if(isSnow == "false" || !isSnow && day == CPT.Day.WEEKDAY) {
				if(value >= 0 && value < 0.1) return "true";
				if(value >= 0.1 && value <= 1) return "false";
			}
			if(isSnow == "true" || isSnow && day == CPT.Day.WEEKEND) {
				if(value >= 0 && value < 0.0001) return "true";
				if(value >= 0.0001 && value <= 1) return "false";
			}
			if(isSnow == "true" || isSnow && day == CPT.Day.WEEKDAY) {
				if(value >= 0 && value < 0.3) return "true";
				if(value >= 0.3 && value <= 1) return "false";
			}
		},
		QueryValue: function(isTrue, isSnow, day) {
			if (isTrue == "true") {
				if(isSnow + day == -2) return 0.4011;
				if(isSnow == -1) {
					if(day == CPT.Day.WEEKEND) return 0.0011;
					if(day == CPT.Day.WEEKDAY) return 0.4;
				}
				if(day == -1) {
					if(isSnow == "true") return 0.3001;
					if(isSnow == "false") return 0.101;
				}
				if (isSnow == "false" && day == CPT.Day.WEEKEND) return 0.001;
				if (isSnow == "false" && day == CPT.Day.WEEKDAY) return 0.01;
				if (isSnow == "true" && day == CPT.Day.WEEKEND) return 0.0001;
				if (isSnow == "true" && day == CPT.Day.WEEKDAY) return 0.3;
			} else {
				if(isSnow + day == -2) return 3.5989;
				if(isSnow == -1) {
					if(day == CPT.Day.WEEKEND) return 1.9989;
					if(day == CPT.Day.WEEKDAY) return 1.6;
				}
				if(day == -1) {
					if(isSnow == "true") return 1.6999;
					if(isSnow == "false") return 1.899;
				}
				if (isSnow == "false" && day == CPT.Day.WEEKEND) return 1 - 0.001;
				if (isSnow == "false" && day == CPT.Day.WEEKDAY) return 1 - 0.01;
				if (isSnow == "true" && day == CPT.Day.WEEKEND) return 1 - 0.0001;
				if (isSnow == "true" && day == CPT.Day.WEEKDAY) return 1 - 0.3;
			}
		}
	},

	// Stress (high/true, low/false)
	//      depends on [Snow, Exams]
	Stress: {
		SimulateValue: function(value, isSnow, exams) {
			if(isSnow == "false" || !isSnow && exams == "false") {
				if(value >= 0 && value < 0.01) return "high";
				if(value >= 0.01 && value <= 1) return "low";
			}
			if(isSnow == "false" || !isSnow && exams == "true") {
				if(value >= 0 && value < 0.2) return "high";
				if(value >= 0.2 && value <= 1) return "low";
			}
			if(isSnow == "true" || isSnow && exams == "false") {
				if(value >= 0 && value < 0.1) return "high";
				if(value >= 0.1 && value <= 1) return "low";
			}
			if(isSnow == "true" || isSnow && exams == "true") {
				if(value >= 0 && value < 0.5) return "high";
				if(value >= 0.5 && value <= 1) return "low";
			}
		},
		QueryValue: function(isHigh, isSnow, isExams) {
			if (isHigh) {
				if(isSnow + isExams == -1) return 0.81;
				if(isSnow == -1) {
					if(isExams == "true") return 0.7;
					if(isExams == "false") return 0.11;
				}
				if(isExams == -1) {
					if(isSnow == "true") return 0.6;
					if(isSnow == "false") return 0.21;
				}
				if(isSnow == "false" && isExams == "false") return 0.01;
				if(isSnow == "false" && isExams == "true") return 0.2;
				if(isSnow == "true" && isExams == "false") return 0.1;
				if(isSnow == "true" && isExams == "true") return 0.5;
			} else {
				if(isSnow + isExams == -1) return 3.19;
				if(isSnow == -1) {
					if(isExams == "true") return 1.3;
					if(isExams == "false") return 1.89;
				}
				if(isExams == -1) {
					if(isSnow == "true") return 1.4;
					if(isSnow == "false") return 1.79;
				}
				if(isSnow == "false" && isExams == "false") return 1 - 0.01;
				if(isSnow == "false" && isExams == "true") return 1 - 0.2;
				if(isSnow == "true" && isExams == "false") return 1 - 0.1;
				if(isSnow == "true" && isExams == "true") return 1 - 0.5;
			}
		}
	}
}

module.exports = Network; 