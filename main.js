require('prototypes')();

let crRoles = require('creep.roles');
let creepScheduler = require('creep.spawning');

let mineList = require('resource.list').mines;
let mineralList = require('resource.list').minerals;
let controllerList = require('resource.list').controllers;

let towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);
let roomList = require('resource.list').rooms.map((name) => {return Game.rooms[name]});
let linkIdList = require('resource.list').links;



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
    
    let linkList = linkIdList.map(array => (array.map(Game.getObjectById)));
    linkList[0][1].transferEnergy(linkList[0][2]);
    linkList[0][1].transferEnergy(linkList[0][0]);
    linkList[0][0].transferEnergy(linkList[0][2]);
    linkList[1][0].transferEnergy(linkList[1][1]);
    linkList[1][2].transferEnergy(linkList[1][1]);
    linkList[1][3].transferEnergy(linkList[1][1]);
    linkList[2][0].transferEnergy(linkList[2][2]);
    linkList[2][1].transferEnergy(linkList[2][2]);
    linkList[2][3].transferEnergy(linkList[2][2]);


    
    let invaders = undefined;
    for(let roomName in Game.rooms) {
        if (['W49N31', 'W49N34', 'W48N34'].includes(roomName) && (invaders = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS)).length > 0 
                && invaders[0].owner.username === 'Invader') {
            if(!(Memory.defenderSpawned || _.some(Game.creeps, {role: 'defender'}) || _.some(Game.rooms, r => r.memory.creepStack && r.memory.creepStack.includes('defender')))) {
                Memory.defenderSpawned = true;
                switch(roomName) {
                case 'W49N34': case 'W48N34':
                    Game.rooms.W49N33.pushStack('defender');
                    break;
                case 'W49N31':
                    Game.rooms.W49N32.pushStack('defender');
                    break;
                }
            }      
            break;
        } 
        
    }
    
    
    for(i=0; i<towers.length; i++) {
        towers[i].run(!!(invaders ? invaders.length : false));
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        switch(creep.memory.role) {
            case 'miner':
                crRoles.roleMiner.run(creep);
                break;
            case 'remoteminer':
                crRoles.roleRemoteMiner.run(creep);
                break;
            case 'hauler':
                crRoles.roleHauler.run(creep);
                break;
            case 'maintainer':
                crRoles.roleBuilder.run(creep);
                break;
            case 'builder':
                crRoles.roleBuilder.run(creep);
                break;
            case 'claimer':
                crRoles.roleClaimer.run(creep);
                break;
            case 'upgrader':
                crRoles.roleUpgrader.run(creep);
                break;
            case 'oldupgrader':
                crRoles.roleOldUpgrader.run(creep);
                break;
            case 'defender':
                crRoles.roleDefender.run(creep, invaders[0] ? invaders[0].pos.roomName : undefined);
                break;
            case 'warrior':
                crRoles.roleWarrior.run(creep, 3);
                break;
            case 'paladin':
                crRoles.rolePaladin.run(creep, 4);
                break;
            case 'engineer':
                crRoles.roleEngineer.run(creep, 2);
                break;
            case 'archer':
                crRoles.roleWarrior.run(creep, 4);
                break;
            case 'harvester':
                crRoles.roleHarvester.run(creep);
                //roleHauler.run(creep);
                break;
            default:
                //console.log('WARNING: unassigned creep: '); 
                creep.getRecycled();
                break;
        }
    }

}