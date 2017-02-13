///make the network here
// feel free to rename shit if variables seem too vague

function Node() {
    this.children;
    this.parents;
}

function Network() {
    this.roots;
}

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

function CPT() {

    this.Cloudy = function(isCloudy) {
        return isCloudy ? 0.9 : 0.3;
    }

    this.Icy = function(isIcy, h, t) {
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
        return Error("INVALID PARAMETERS Humidity: " + h + " Temperature: " + t);
    }

    this.Snow = function(isSnow, h, t) {
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
    }

    this.Exams = function(isTrue, isSnow, day) {
        if (isTrue) {
            if (!isSnow && day == Day.WEEKEND) return 0.001;
            if (!isSnow && day == Day.WEEKDAY) return 0.01;
            if (isSnow && day == Day.WEEKEND) return 0.0001;
            if (isSnow && day == Day.WEEKDAY) return 0.3;
        } else {
            //TODO return probability if exams = false;
        }
    }

    this.Stress = function(isHigh, isSnow, isExams) {
        if (isHigh) {
            if(!isSnow && !isExams) return 0.01;
            if(!isSnow && isExams) return 0.2;
            if(isSnow && !isExams) return 0.1;
            if(isSnow && isExams) return 0.5;
        } else {
            //TODO return probability if stress = low
        }
    }
}