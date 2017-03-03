function action(){
    
    // what kind of action are we about to do?
    this.action = 'move'
    this.value = 0;
    this.index = 1;

    return this;
}

module.exports = action;
