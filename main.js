var roleHarvester = require('creep.roles').roleHarvester;
var roleUpgrader = require('creep.roles').roleUpgrader;
var roleBuilder = require('creep.roles').roleBuilder;
var roleWarrior = require('creep.roles').roleWarrior;
var roleHauler = require('creep.roles').roleHauler;

var sTower = require('s.tower');

var mineList = require('resource.list');

var tower = Game.getObjectById('5787e5f4ff461729540e4850');


module.exports.loop = function () { 
    
    if(Game.time%10000 == 0) {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    var harvesters00 = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.mine == mineList[0][0]);    
    var harvesters10 = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.mine == mineList[1][0]);
    //var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    var upgraders01 = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.mine == mineList[0][1]);
    
    var warriors = _.filter(Game.creeps, (creep) => creep.memory.role == 'warrior');
    /* var archers = _.filter(Game.creeps, (creep) => creep.memory.role == 'archer');
    var tanks = _.filter(Game.creeps, (creep) => creep.memory.role == 'tank');
    var healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer'); */
    
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    
    sTower.run(tower);

    if(claimers.length < 0) {
        var newName = Game.spawns.Spawn1.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,CLAIM,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'warrior'});
        if (!(newName < 0)) console.log('Spawning new upgrader01: ' + newName); }
    if(warriors.length < 0) {
        var newName = Game.spawns.Spawn1.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'warrior'});
        if (!(newName < 0)) console.log('Spawning new upgrader01: ' + newName); }
        
    /*if(builders.length < 0) {
       var newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
        if (!(newName < 0)) console.log('Spawning new builder: ' + newName);
    }*/
    if(upgraders01.length < 3) {
        var newName = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader', mine: mineList[0][1]});
        if (!(newName < 0)) console.log('Spawning new upgrader01: ' + newName);
    }
    if(haulers.length < 0) {
       var newName = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'hauler', h:false});
        if (!(newName < 0)) console.log('Spawning new hauler: ' + newName);
    }
    
    // if(Game.time%3000 == 0) {
    //     var newName = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'harvester', mine: mineList[1][0]});
    //if (!(newName < 0)) console.log('Spawning new harvester10: ' + newName);
    //  }
    if(harvesters00.length < 3) {
        var newName = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'harvester', mine: mineList[0][0]});
        if (!(newName < 0)) console.log('Spawning new harvester00: ' + newName);
    }
    
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
           roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'archer' || creep.memory.role == 'warrior') {
           roleWarrior.run(creep);
        }
    //  if(creep.memory.role == 'builder') {
    //      roleBuilder.run(creep);
    //  }
        if(creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        
    }
}


//////////////////////////


