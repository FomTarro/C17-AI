function mon(){
    
    this.species ='';
    this.currentHP = 1;
    this.maxHP = 1;
    this.status ='';
    this.stats =[];
    this.ability ='';
    this.item = '';
    this.moves = [];
    this.weaknesses = [];
    this.resistances = [];

    return this;
}

module.exports = mon;
