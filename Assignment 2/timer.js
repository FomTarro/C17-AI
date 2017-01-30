// Timer class. Accepts the maximum timer length in milliseconds as the constructor argument
function Timer(time){
    this.maxTime = time;
    this.currentTime = 0;

    // assign a function that should occur on time expiration
    this.onExpire = function(){
        console.log("timer has expired!")
    }

    // call to start the timer tick with a 1ms refire interval
    this.startTick = function(){
        var startingTime =  Date.now();
        var refire = this.setInterval(
            function(){
                currentTime = Date.now() - startingTime;
                if(currentTime >= maxTime){
                    clearInterval(refire);
                    onExpire();
                }
                return;
            }, 1);
        return;
    }
return this;
}

// EXAMPLE IMPLEMENTATION //

var timer = Timer(1000);
timer.onExpire = function(){
    console.log("an alternate expiration message!");
}
timer.startTick();
console.log("this timer isn't hogging the thread!");

