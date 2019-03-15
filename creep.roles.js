/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.roles');
 * mod.thing == 'a thing'; // true
 */
var crFunc = require('cr.func');


var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
           
        var target;
        if(!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
        }
        if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
        }
        
        if (creep.memory.harvesting) {
            if ((target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)) && creep.pos.getRangeTo(target) < 20) {} else {
                target = Game.getObjectById(creep.memory.mine);
            }
            if (crFunc.take(creep, target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target); }
            if (crFunc.take(creep, target, RESOURCE_ENERGY) == ERR_INVALID_TARGET || target == null)  {
                creep.moveTo(_.find(Game.flags, function(f) {return f.memory == creep.memory.mine;}));
            }
        } else {
            roleBuilder.run(creep);
            var targets = 0, containers = 0, dispensers = 0;
            if ((dispensers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            ((structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER)
                                && structure.energy < structure.energyCapacity) 
                                ) } } ) ).length > 0 ) {
                targets = dispensers;}
            else if ((containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            ((structure.structureType == STRUCTURE_CONTAINER
                            || structure.structureType == STRUCTURE_STORAGE) && 
                                structure.store[RESOURCE_ENERGY] < structure.storeCapacity) 
                                ) } } ) ).length > 0 ) {
                targets = containers; }
            if(targets) {
                if (creep.room !== Game.rooms['W48N33']) {
                    creep.moveTo(Game.getObjectById('57893afb24ea89b648e9811f'));
                }
                target = creep.pos.findClosestByRange(targets);
                //creep.say(target.id);
                if(crFunc.give(creep, target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target); } 
            }
        }
    }
};

var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        /* var mine = Game.getObjectById(creep.memory.mine);
        var target;
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }

        if(creep.memory.building) { */
            target = creep.pos.findClosestByRange(creep.room.find(FIND_CONSTRUCTION_SITES));
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } 
            } else roleRepairer.run(creep);
       /* }
        else {
            //var source = creep.pos.findClosestByRange(creep.room.find(FIND_SOURCES));
            var dropped = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            if (dropped && creep.pos.getRangeTo(dropped) < 10) { target = dropped; }
            else { 
                target = mine;  }
            if(crFunc.take(creep, target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } */
        
    }
};

var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var mine = Game.getObjectById(creep.memory.mine);
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            //var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(mine) == ERR_NOT_IN_RANGE) {
                creep.moveTo(mine);
            }
        }
    }
};
    
var roleHauler = {
    /** @param {Creep} creep **/
    run: function(creep) {
    	var targets, tar;
    	
    	if(creep.memory.h && creep.carry.energy == 0) 
            creep.memory.h = false;        
        if(!creep.memory.h && creep.carry.energy == creep.carryCapacity) 
            creep.memory.h = true; 
    	
        if(!creep.memory.h) {
            var dropped;
            if (dropped = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY) && creep.pos.getRangeTo(dropped) < 20) { target = dropped; }
        	 else target = creep.pos.findClosestByRange( creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_CONTAINER) && structure.energy >= 50; } } ) );
        		if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
        			creep.moveTo(tar);
        		
        } else roleRepairer.run(creep);
    }
};

var roleRepairer = {
run: function(creep) {
    	var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax * 0.8 && structure.hits < 100000
    });
    if(closestDamagedStructure) {
        if(creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestDamagedStructure);
        }
    }
}
};

var roleWarrior = {
    run:function(creep) {
        var warFlag = Game.flags['war'];
        var hostiles, towers;
        
        if(warFlag.memory.isWallFlag) {
            crFunc.attack(creep, Room.getObjectById(warFlag.memory.WallFlag));
        }
        
        if ((hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10)).length > 0) {
            crFunc.attack(creep, creep.pos.findClosestByRange(hostiles)); 
        } else if ((hostiles = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 20)).length > 0) {
            if (towers = _.filter(hostiles, function(s) {return s instanceof StructureTower; })) {
            	crFunc.attack(creep, warFlag.pos.findClosestByRange(towers)); }
            else crFunc.attack(creep, creep.pos.findClosestByRange(hostiles)); 
        } else { creep.moveTo(warFlag); }
    }
}

module.exports = { roleHarvester, roleBuilder, roleHauler, roleUpgrader, roleRepairer, roleWarrior };