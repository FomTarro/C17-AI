///make the network here
// feel free to rename shit if variables seem too vague

function Node(name, cpt, children) {
    this.name = name;
    this.children = children;
    this.CPT = cpt;
    return this;
}

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
        var tempNode = new Node("Temp", CPT.Temperature, [icyNode, snowNode]);

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

var network = new Network();
network.Init();
network.PrintNetwork();

var Humidity = {
    LOW: 0.2,
    MEDIUM: 0.5,
    HIGH: 0.3
}

var Temperature = {
    WARM: 0.1,
    MILD: 0.4,
    COLD: 0.5
}

var Day = {
    WEEKEND: 0.2,
    WEEKDAY: 0.8
}

var CPT = {

    Humidity: Humidity,

    Temperature: Temperature,

    Day: Day,

    Cloudy: function(isCloudy) {
        return isCloudy ? 0.9 : 0.3;
    },

    Icy: function(isIcy, h, t) {
        if (isIcy) {
            if (h == Humidity.LOW && t == Temperature.WARM) return 0.001;
            if (h == Humidity.LOW && t == Temperature.MILD) return 0.01;
            if (h == Humidity.LOW && t == Temperature.COLD) return 0.05;
            if (h == Humidity.MEDIUM && t == Temperature.WARM) return 0.001;
            if (h == Humidity.MEDIUM && t == Temperature.MILD) return 0.03;
            if (h == Humidity.MEDIUM && t == Temperature.COLD) return 0.02;
            if (h == Humidity.HIGH && t == Temperature.WARM) return 0.005;
            if (h == Humidity.HIGH && t == Temperature.MILD) return 0.01;
            if (h == Humidity.HIGH && t == Temperature.COLD) return 0.35;
        } else {
            if (h == Humidity.LOW && t == Temperature.WARM) return 1 - 0.001;
            if (h == Humidity.LOW && t == Temperature.MILD) return 1 - 0.01;
            if (h == Humidity.LOW && t == Temperature.COLD) return 1 - 0.05;
            if (h == Humidity.MEDIUM && t == Temperature.WARM) return 1 - 0.001;
            if (h == Humidity.MEDIUM && t == Temperature.MILD) return 1 - 0.03;
            if (h == Humidity.MEDIUM && t == Temperature.COLD) return 1 - 0.02;
            if (h == Humidity.HIGH && t == Temperature.WARM) return 1 - 0.005;
            if (h == Humidity.HIGH && t == Temperature.MILD) return 1 - 0.01;
            if (h == Humidity.HIGH && t == Temperature.COLD) return 1 - 0.35;
        }
    },

    Snow: function(isSnow, h, t) {
        if (isSnow) {
            if (h == Humidity.LOW && t == Temperature.WARM) return 0.00001;
            if (h == Humidity.LOW && t == Temperature.MILD) return 0.001;
            if (h == Humidity.LOW && t == Temperature.COLD) return 0.01;
            if (h == Humidity.MEDIUM && t == Temperature.WARM) return 0.00001;
            if (h == Humidity.MEDIUM && t == Temperature.MILD) return 0.0001;
            if (h == Humidity.MEDIUM && t == Temperature.COLD) return 0.25;
            if (h == Humidity.HIGH && t == Temperature.WARM) return 0.0001;
            if (h == Humidity.HIGH && t == Temperature.MILD) return 0.001;
            if (h == Humidity.HIGH && t == Temperature.COLD) return 0.4;
        } else {
            if (h == Humidity.LOW && t == Temperature.WARM) return 1 - 0.00001;
            if (h == Humidity.LOW && t == Temperature.MILD) return 1 - 0.001;
            if (h == Humidity.LOW && t == Temperature.COLD) return 1 - 0.01;
            if (h == Humidity.MEDIUM && t == Temperature.WARM) return 1 - 0.00001;
            if (h == Humidity.MEDIUM && t == Temperature.MILD) return 1 - 0.0001;
            if (h == Humidity.MEDIUM && t == Temperature.COLD) return 1 - 0.25;
            if (h == Humidity.HIGH && t == Temperature.WARM) return 1 - 0.0001;
            if (h == Humidity.HIGH && t == Temperature.MILD) return 1 - 0.001;
            if (h == Humidity.HIGH && t == Temperature.COLD) return 1 - 0.4;
        }
    },

    Exams: function(isTrue, isSnow, day) {
        if (isTrue) {
            if (!isSnow && day == Day.WEEKEND) return 0.001;
            if (!isSnow && day == Day.WEEKDAY) return 0.01;
            if (isSnow && day == Day.WEEKEND) return 0.0001;
            if (isSnow && day == Day.WEEKDAY) return 0.3;
        } else {
            if (!isSnow && day == Day.WEEKEND) return 1 - 0.001;
            if (!isSnow && day == Day.WEEKDAY) return 1 - 0.01;
            if (isSnow && day == Day.WEEKEND) return 1 - 0.0001;
            if (isSnow && day == Day.WEEKDAY) return 1 - 0.3;
        }
    },

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