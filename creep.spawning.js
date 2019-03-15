require('prototypes')();

var roomList = require('resource.list').rooms.map((name) => {return Game.rooms[name]});
 
var creepScheduler = {
    run: function() {
        
        for(let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            if(room && room.controller && room.controller.my && _.filter(Game.creeps, c => c.pos.roomName === roomName).length === 0 && room.energyAvailable >= 300) {
                room.memory.creepStack.unshift('haulermini');
            }
        }
        
        
        if((Game.time+250)%6000 == 0) { roomList[0].pushStack('upgrader0'); }
        if((Game.time+256)%6000 == 0) { roomList[0].pushStack('builder'); }
        if((Game.time+50)%1480 == 0) { roomList[0].pushStack('oldupgrader'); }
        if((Game.time-800)%1490 == 0) { roomList[0].pushStack('miner0'); }
        //if((Game.time-700)%1490 == 0) { roomList[0].pushStack('minerO'); }
        if((Game.time)%1400 == 0) { roomList[0].pushStack('hauler'); }
        //if((Game.time+100)%1500 == 0) { roomList[0].pushStack('miner02'); }
        //if((Game.time+150)%750 == 0){ roomList[0].pushStack('claimer1'); }
        /*
        //if(warriors.length < 0) { roomList[0].pushStack('warrior'); }
        //if(paladins.length < 0) { roomList[0].pushStack('paladin'); }
        //if(clerics.length < 0) { roomList[0].pushStack('cleric'); }
        */
        /* if (Game.rooms['W49N33']) {
        //    if((Game.rooms['W49N33'].find(FIND_HOSTILE_CREEPS).length > 0) && (!_.includes(Memory.rooms['W48N33'].creepStack, 'miniwarrior')) && (_.filter(Game.creeps, (creep) => creep.memory.role == 'warrior').length < 1)) {
        //    roomList[0].pushStack('warriormini');
        //    }
        } */
        
        
        if((Game.time+3300)%6000 == 0) { roomList[1].pushStack('builder'); }
        if((Game.time+90)%1450 == 0) { roomList[1].pushStack('miner10'); }
        if((Game.time)%1450 == 0) { roomList[1].pushStack('miner11'); }
        //if((Game.time-90)%1450 == 0) { roomList[1].pushStack('minerH'); }
        if((Game.time+150)%20000 == 0){ roomList[1].pushStack('claimer0'); }
        if((Game.time+200)%20000 == 0){ roomList[1].pushStack('claimer1'); }
        if((Game.time+450)%750 == 0) { roomList[1].pushStack('remoteminer40'); }
        if((Game.time+550)%750 == 0) { roomList[1].pushStack('remoteminer50'); }
        if((Game.time+234)%1200 == 0) { roomList[1].pushStack('upgrader1'); }
        //if((Game.time+300)%6000 == 0) { roomList[1].pushStack('harvester10'); }
        //if((Game.time+3300)%6000 == 0) { roomList[1].pushStack('harvester11'); }
        if((Game.time)%1400 == 0) { roomList[1].pushStack('hauler'); }
    
        //if((Game.time+150)%1500 == 0) { roomList[1].pushStack('upgrader1bis'); }
        
        
        
        if((Game.time+100)%1400 == 0) { roomList[2].pushStack('hauler'); }
        if((Game.time+200)%6000 == 0) { roomList[2].pushStack('builder'); }
        if((Game.time+120)%1490 == 0) { roomList[2].pushStack('miner20'); }
        if((Game.time+1140)%1490 == 0) { roomList[2].pushStack('miner21'); }
        if((Game.time+272)%1500 == 0) { roomList[2].pushStack('upgrader2'); }
        if((Game.time+2000)%3000 == 0) { roomList[2].pushStack('harvester21'); }
        if((Game.time+550)%3000 == 0) { roomList[2].pushStack('harvester20'); }
        //if((Game.time+272)%500 == 0) { roomList[2].pushStack('upgrader2bis'); }
        //if((Game.time+650)%2940 == 0) { roomList[2].pushStack('minerK'); }
        //if((Game.time+300)%19900 == 0){ roomList[2].pushStack('claimer3'); }
        if((Game.time+150)%750 == 0) { roomList[2].pushStack('remoteminer30'); }
        
    }
}
module.exports = creepScheduler;