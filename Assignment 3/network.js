///make the network here
// feel free to rename shit if variables seem too vague

/**
 * Node Class
 *  name        name of node
 *  children    an array of children. if node is a leaf, then this is undefined
 *  CPT         CPT function. Has different params depending on node.
 *              example for Snow node: - node.CPT(true, CPT.Humidity.LOW, CPT.Temperature.MILD) 
 */
function Node(name, cpt, children) {
    this.name = name;
    this.children = children;
    this.CPT = cpt;
    return this;
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
        var stressNode = new Node("stress", CPT.Stress);
        var examsNode = new Node("exams", CPT.Exams, [stressNode]);
        var cloudyNode = new Node("cloudy", CPT.Cloudy);
        var dayNode = new Node("day", CPT.Day, [examsNode]);
        var snowNode = new Node("snow", CPT.Snow, [cloudyNode, stressNode, examsNode]);
        var icyNode = new Node("icy", CPT.Icy);
        var humidNode = new Node("humidity", CPT.Humidity, [icyNode, snowNode]);
        var tempNode = new Node("temp", CPT.Temperature, [icyNode, snowNode]);

        this.topNodes = [humidNode, tempNode, dayNode];
    }

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
        HIGH: 0.3
    },

    // Temperature (WARM, MILD, COLD)
    Temperature: {
        WARM: 0.1,
        MILD: 0.4,
        COLD: 0.5
    },

    // Day (WEEKDAY, WEEKEND)
    Day: {
        WEEKEND: 0.2,
        WEEKDAY: 0.8
    },

    // Cloudy (true, false)
    Cloudy: function(isCloudy) {
        return isCloudy ? 0.9 : 0.3;
    },

    // Icy (true, false)
    //      depends on [Humidity, Temperature]
    Icy: function(isIcy, h, t) {
        if (isIcy) {
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.WARM) return 0.001;
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.MILD) return 0.01;
            if (h == CPT.Humidity.LOW && t == CPT.Temperature.COLD) return 0.05;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.WARM) return 0.001;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.MILD) return 0.03;
            if (h == CPT.Humidity.MEDIUM && t == CPT.Temperature.COLD) return 0.02;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.WARM) return 0.005;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.MILD) return 0.01;
            if (h == CPT.Humidity.HIGH && t == CPT.Temperature.COLD) return 0.35;
        } else {
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