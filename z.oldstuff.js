
//var miners00 = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.mine == mineList[0][0]);    
//var miners01 = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.mine == mineList[0][1]);
//var remoteminers10 = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteminer' && creep.memory.mine == mineList[1][0]);
//var remoteminers11 = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteminer' && creep.memory.mine == mineList[1][1]);        

var warriors = _.filter(Game.creeps, (creep) => creep.memory.role == 'warrior');

//var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');
//var upgraders0 = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.controller == controllerList[0]);
//var claimers1 = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.controller == controllerList[0]);

//var warriors = _.filter(Game.creeps, (creep) => creep.memory.role == 'warrior');
//var paladins;
//var archers;




    /*
     gWorCreep: function(sRole, name, percWork, percCarry, spawn, energy, roads) {
     var parts = ']', cost = 0;

     roCost = roads ? 0.5 : 1;
     coWork = 2 + roCost;
     coCarry = 1 + roCost;

     var nWork = 0, 
     nCarry = 0, 
     enWork = 0, 
     enCarry = 0;

     var done = false, 
     iEnergy = floor(energy/50),
     tot = 0;

     while (ceil(tot + coCarry) <= iEnergy) {
     if (ceil(nWork*coWork)*percWork <= ceil(nCarry*coCarry)*percCarry) {
     if(tot + coWork <= iEnergy) {
     nWork++;
     tot += coWork;
     }
     } else { 
     nCarry++;
     tot += coCarry;
     }

     if((ceil(tot + coWork) > iEnergy) && ceil(tot + coCarry <= iEnergy)) {
     nCarry++;
     tot += coCarry;
     }
     }

     var nMove = ceil((work + carry) * (if (roads) 0.5 else 1));

     ',MOVE'.repeat(nMove).concat(parts);
     ',CARRY'.repeat(nCarry).concat(parts);
     ',WORK'.repeat(nWork).concat(parts);
     '['.concat(parts.substring(1));

     if (name)
     spawn.createCreep(parts, name, { role: sRole });
     else
     spawn.createCreep(parts, undefined, { role: sRole });
     }
     */

//FLAG SYSTEM




/*




function(this, target) {
    var direction = this.pos.getDirectionTo(target);
    var distance = this.pos.getRangeTo(target);

    var archer = _.some(this.body, {type: 'ranged_attack'});
    var engineer =  _.some(this.body, {type: 'work'});
    console.log(engineer);
    //console.log(this.body);
    if (archer) {
        this.rangedAttack(target);
        if(distance < 3 ) {
            var away = (direction+3)%8 +1;
            if(this.move(away)) if (this.move((away+1)%8+1)) if (this.move((away-1)%8+1)) if (this.move((away+2)%8+1)) if (this.move((away-2)%8+1)) {this.attack(target); this.rangedMassAttack();}
        } else if (distance > 3) moveTo(target);
    } else if (engineer)
    //&& (target instanceof Structure))
    {
        //console.log('wooo')
        if (this.dismantle(target) == ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        } //else sayRoutine(this, 'attack');
    } else {
        if (this.attack(target) == ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        } //else sayRoutine(this, 'attack');
    }
} ,



function (target) {

    if (!this.my) {
        return C.ERR_NOT_OWNER;
    }
    if (this.spawning) {
        return C.ERR_BUSY;
    }
    if (this.getActiveBodyParts(C.ATTACK) == 0) {
        return C.ERR_NO_BODYPART;
    }
    if (!target || !target.id || !register.thiss[target.id] && !register.structures[target.id] || !(target instanceof globals.this) && !(target instanceof globals.StructureSpawn) && !(target instanceof globals.Structure)) {
        register.assertTargetObject(target);
        return C.ERR_INVALID_TARGET;
    }
    if (!target.pos.isNearTo(this.pos)) {
        return C.ERR_NOT_IN_RANGE;
    }

    intents.set(this.id, 'attack', { id: target.id, x: target.pos.x, y: target.pos.y });
    return C.OK;
}







sayRoutine: function (this, role) {
    /*if (this.memory.sayI === undefined) this.memory.sayI = 0;
     let sayStr;
     switch (role) {
     case 'attack': sayStr = 'Bam! Bif! Pow! Smack! Boff! Zlonk! Kapow! Sok! Blap! Whamm! Zok! Crash! Phoomph! Whack! Clank! Zlott! Rrip! Vronk!'; break;
     case 'engineer': sayStr = 'Hello, dont mind me, Im just a simple engineer and Ill just have a brief look at your wares and do a little testing for structural stability, this will just take a minute and will be completely painless!'; break;
     case 'warrior': sayStr = 'NO ESCAPE'; break;
     default: sayStr = 'Im a little teapot short and stout. Here is my handle. Here is my spout. When I get all steamed up, Hear me shout! Just tip me over And pour me out Im a clever teapot, yes its true. Heres an example of what I can do. I can turn my handle to a spout. Just tip me over and pour me out '; break;
     }

     let saySplit = _.split(sayStr.substring(this.memory.sayI), ' ');
     let sayPart = '', i=0;
     // i gets raised in side
     do {
     let nextWord = saySplit.shift();
     if(nextWord.length + i + 1 < 10) {
     sayPart.push(' ' + nextWord);
     i += nextWord.length + 1;
     } else i = 10;
     } while (i<10);
     this.say(sayPart, true);
     this.memory.sayI += sayPart.length + 1;
     if (sayStr.substring(this.memory.sayI) === '') this.memory.sayI = 0;
},




};

*/