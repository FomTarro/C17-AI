// Timer class. Accepts the maximum timer length in milliseconds as the constructor argument
function Timer(time){ 

    var startingTime = 0;
    var maxTime = time;
    var currentTime = 0;

    var refire;

    this.getCurrentTime = function() {
        return currentTime;
    }
    this.getMaxTime = function() {
        return maxTime;
    }

    this.timeLeft = function(){
        return maxTime - currentTime;
    }

    // assign a function that should occur on time expiration
    this.onExpire = function(){
        console.log("timer has expired!")
    }

    // call to start the timer tick with a 1ms refire interval
    this.startTick = function(){
        startingTime = Date.now();
        setInterval(tick, 10);
        return;
    }

    function tick() {
        console.log("tick");
        currentTime = Date.now() - startingTime;
        if(currentTime >= maxTime){
            clearInterval(refire);
            onExpire();
        }
    }

    return this;
}

module.exports = Timer;