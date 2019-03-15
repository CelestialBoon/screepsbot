require('prototypes')();

var roleMiner = require('creep.roles').roleMiner;
var roleHauler = require('creep.roles').roleHauler;
var roleWarrior = require('creep.roles').roleWarrior;
var rolePaladin = require('creep.roles').rolePaladin;
var roleBuilder = require('creep.roles').roleBuilder;
var roleClaimer = require('creep.roles').roleClaimer;
var roleUpgrader = require('creep.roles').roleUpgrader;
var roleEngineer = require('creep.roles').roleEngineer;
var roleHarvester = require('creep.roles').roleHarvester;
var roleRemoteMiner = require('creep.roles').roleRemoteMiner;
var roleOldUpgrader = require('creep.roles').roleOldUpgrader;

var creepScheduler = require('creep.spawning');

var mineList = require('resource.list').mines;
var mineralList = require('resource.list').minerals;
var controllerList = require('resource.list').controllers;

var towers = _.filter(Game.structures, function (s) { return s.structureType == STRUCTURE_TOWER });
var roomList = require('resource.list').rooms.map((name) => {return Game.rooms[name]});
var linkList = require('resource.list').links;




module.exports.loop = function () {
    
    
    if(Game.time%5000 == 0) {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    creepScheduler.run();

    for(let name in Game.spawns) {
        Game.spawns[name].handleSpawnStack();
    }

    Game.getObjectById(linkList[0][1]).transferEnergy(Game.getObjectById(linkList[0][2]));
    Game.getObjectById(linkList[0][1]).transferEnergy(Game.getObjectById(linkList[0][0]));
    Game.getObjectById(linkList[0][0]).transferEnergy(Game.getObjectById(linkList[0][2]));
    Game.getObjectById(linkList[1][0]).transferEnergy(Game.getObjectById(linkList[1][1]));
    Game.getObjectById(linkList[1][2]).transferEnergy(Game.getObjectById(linkList[1][1]));


    for(i=0; i<towers.length; i++) {
        towers[i].run();
    }
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        switch(creep.memory.role) {
            case 'miner': 
                roleMiner.run(creep); 
                break;
            case 'remoteminer': 
                roleRemoteMiner.run(creep); 
                break;
            case 'hauler': 
                roleHauler.run(creep); 
                break;
            case 'maintainer': 
                roleBuilder.run(creep); 
                break;
            case 'builder': 
                roleBuilder.run(creep); 
                break;
            case 'claimer': 
                roleClaimer.run(creep); 
                break;
            case 'upgrader': 
                roleUpgrader.run(creep); 
                break;
            case 'oldupgrader': 
                roleOldUpgrader.run(creep); 
                break;
            case 'warrior': 
                roleWarrior.run(creep, 3); 
                break;
            case 'paladin':
                rolePaladin.run(creep, 0);
                break;
            case 'engineer':
                roleEngineer.run(creep,2);
                break;
            case 'archer':
                roleWarrior.run(creep, 4); 
                break
            case 'harvester': 
                roleHarvester.run(creep);
                //roleHauler.run(creep);
                break;        
            default: 
                //console.log('WARNING: unassigned creep: '); 
                creep.getRecycled(); 
                break;
        }
    } 
}