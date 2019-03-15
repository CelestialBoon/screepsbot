require('prototypes')();

var roleMaintainer = {
    /** @param {Creep} creep **/
    run: function(creep) {
       if(creep.spawning) {return; }
        if(creep.carry.energy > 0) {
            let targets;
            if((targets = creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3)).length > 0) {
                creep.cancelOrder('move');
                creep.build(creep.pos.findClosestByRange(targets));
            } else {
                if((targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: (structure) => { return (structure.hits < structure.hitsMax * 0.9 && structure.hits < 250000)
                }})).length > 0) {
                    creep.repair(creep.pos.findClosestByRange(targets));
                }
            }
        }
    }
};

var roleMiner = {
    run: function (creep) {
        if(creep.spawning) {return; }
        //custom cycleCheck
        var mine = Game.getObjectById(creep.memory.mine);
        var position = new RoomPosition(creep.memory.x, creep.memory.y, creep.memory.room);
        if(creep.pos !== position) {
        creep.moveTo(position); } 
        creep.harvest(mine); 
        let links;
        if(creep.carryCapacity > 0 && _.sum(creep.carry) === creep.carryCapacity && (links = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (str) => {return str.structureType == STRUCTURE_LINK}})).length > 0) {
            creep.give(links[0], RESOURCE_ENERGY);
        if(mine.energy === 0) roleMaintainer.run(creep);
        }
    }
};


var roleRemoteMiner = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.spawning) {return; }
        creep.cycleCheck();
        var mine = Game.getObjectById(creep.memory.mine);
        var store = Game.getObjectById(creep.memory.storage);

        var dropped, dispenser;
        if(creep.memory.cycle) {
            if((dropped = creep.pos.findInRange(FIND_DROPPED_ENERGY,5)).length > 0) {
                if (creep.take(dropped[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped[0]);}   
            } else if(dispenser = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                            filter: (structure) => { return (
                                (structure.structureType == STRUCTURE_CONTAINER)
                                    && structure.store[RESOURCE_ENERGY] > 0 ) } } ).length >0 ) {
                if (creep.take(dispenser, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dispenser); 
                } 
            }
    
            if(mine) {
                if (creep.take(mine, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(mine, {reusePath: 20});}       
            } else {
                creep.moveTo(_.find(Game.flags, function(f) {return (f.memory == creep.memory.mine)}), {reusePath: 20}) 
                //creep.moveTo(Game.flags['Mine10']);
            }
        } else {
            var given = creep.give(store, RESOURCE_ENERGY);
            if (given == ERR_NOT_IN_RANGE || given == ERR_INVALID_TARGET) {
                creep.moveTo(store, {reusePath: 20}); 
            }
            roleMaintainer.run(creep);
        }
    }
};

var roleHauler = {
    /** @param {Creep} creep **/
    run: function(creep) {
    if(creep.spawning) {return; }
        creep.cycleCheck();
        let target, tar, storage;
        if (creep.memory.cycle) {
            if ((target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)) && target.amount > 100 && creep.pos.getRangeTo(target) < 20) {
            } else if (target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => { return (
                            (structure.structureType == STRUCTURE_CONTAINER)
                                && structure.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy
                            || (creep.room.memory.linkStorageReceive === true && structure.structureType == STRUCTURE_LINK
                                && (structure.pos.getRangeTo(structure.room.storage) < 4) && structure.energy > creep.carryCapacity)
                            )}})) {
            } else target = creep.room.storage;
            if (creep.take(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target); 
            }
        } else { 
            for(let carried in creep.carry) {
                if(carried !== 'energy') {
                    if(creep.give(creep.room.storage, carried) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage); 
                    }
                    break;
                } else {
                    if ((target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                    filter: (structure) => { return (
                                                ((structure.structureType == STRUCTURE_EXTENSION ||
                                                structure.structureType == STRUCTURE_SPAWN ||
                                                structure.structureType == STRUCTURE_TOWER)
                                                    && structure.energy < structure.energyCapacity)
                                                )}}))) {
                    } else if(target = _.find(creep.room.find(FIND_MY_STRUCTURES), function(structure) {
                        return structure.room.memory.linkStorageReceive === false && structure.structureType == STRUCTURE_LINK
                        && structure.pos.getRangeTo(structure.room.storage) < 4 && structure.energy < structure.energyCapacity
                    })) {
                    } else target = creep.room.storage;
                    if(creep.give(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target); 
                    } else if(creep.carry.energy > 50) { 
                        creep.moveTo(creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                                    filter: (structure) => { return (
                                                ((structure.structureType == STRUCTURE_EXTENSION ||
                                                structure.structureType == STRUCTURE_SPAWN ||
                                                structure.structureType == STRUCTURE_TOWER)
                                                && structure.energy < structure.energyCapacity && structure !== target)
                                                ) }}));
                    }
                }
            }
        }
    }
};


var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.spawning) {return; }
        creep.cycleCheck();
        var target;
        if(creep.memory.cycle) {
            if (target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => { return (
                            ((structure.structureType === STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER)
                                && structure.store[RESOURCE_ENERGY] >= creep.carryCapacity )
                            || ((structure.structureType == STRUCTURE_LINK)
                                && (structure.pos.getRangeTo(structure.room.storage) < 4) && (structure.energy > 0)))}})) {
                if (creep.take(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target); 
                }
            }
        } else {
            if(target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } 
            } else {
                if(target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => { return (structure.hits < structure.hitsMax * 0.8 && structure.hits < 200000)
                }})) {
                    if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else roleHauler.run(creep);
            }
        }
    }
};

var roleRemoteBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.spawning) {return; }
        if(creep.pos.roomName !== creep.memory.roomName) {
            creep.moveTo(new RoomPosition(creep.memory.x, creep.memory.y, Game.rooms[creep.memory.roomName]));
        } else {           
            creep.cycleCheck();

            if(creep.memory.cycle) {
                var mine = Game.GetObjectById(creep.memory.mine);
                if(creep.harvest(mine) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mine);
                }
            } else {
                if(target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)) {
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    } 
                } else {
                    if(target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => { return (structure.hits < structure.hitsMax * 0.8 && structure.hits < 200000)
                    }})) {
                        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }   
                }                    
            }
        }
    }
};


var roleClaimer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.spawning) {return; }
        var controller = Game.getObjectById(creep.memory.controller);
        if(controller) {
            if(creep.memory.claiming) {
                if (creep.claimController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {reusePath: 20});   
                }
            } else { if (creep.reserveController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {reusePath: 20});   
                }
            }
        } else {
            creep.moveTo(_.find(Game.flags, function(f) {return f.memory == creep.memory.controller;}), {reusePath: 20});
        }
    }
};


var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.spawning) {return; }
        creep.cycleCheck();
        let controller = Game.getObjectById(creep.memory.controller);
        if(!controller) controller = creep.room.controller;
        let target, dropped;
        if(creep.memory.cycle) {
            if((dropped = creep.pos.findInRange(FIND_DROPPED_ENERGY,1)).length > 0) {
                creep.take(dropped[0], RESOURCE_ENERGY);
            } else if((target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => { return (
                    (structure.structureType == STRUCTURE_LINK) && structure.energy > 0 && creep.pos.getRangeTo(structure.pos) <= 3
                )}}))) { 
            } else if(target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => { return (
                    (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
                    && structure.store[RESOURCE_ENERGY] >= creep.carryCapacity
                )}})) {
            } else {
                target = creep.pos.findClosestByRange(FIND_SOURCES, {filter: (patch) => {return patch.energy >0}}); 
            }
            
            if(creep.take(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target); }
        } else {
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
            roleMaintainer.run(creep);
        }
    }
};

var roleOldUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.spawning) {return; }
        var mine = Game.getObjectById(creep.memory.mine);
        creep.cycleCheck();

        if(creep.memory.cycle) {
            //var sources = creep.room.find(FIND_SOURCES);
            var dropped = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            if (creep.pos.getRangeTo(dropped) <2) { mine = dropped; }
            if(creep.take(mine, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(mine);
            }
        } else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
};


var roleWarrior = {
    run:function(creep, distance) {
        if(creep.spawning) {return; }
        var warFlag = Game.flags['war'];
        if(!warFlag) return;
        var hostiles, towers;
        //if (warFlag.memory.forceMov = false) {
       //     creep.moveTo(warFlag, {ignoreDestructibleStructures: true});
       // } else {
            if(creep.pos.getRangeTo(warFlag) > distance)
                creep.moveTo(warFlag);
            var hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, distance*2+30);
            if (hostiles.length > 0) {
                creep.attack(creep.pos.findClosestByRange(hostiles)); 
            } else if ((hostiles = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 10)).length > 0) {
                creep.attack(creep.pos.findClosestByRange(hostiles)); 
            } 
       // }
    }
};

var roleEngineer = {
    run:function(creep, distance) {
        if(creep.spawning) {return; }
        var warFlag = Game.flags['war'];
        if(!warFlag) return;
        var hostiles, towers;
        if (warFlag.memory.forceMov == true) {
            creep.moveTo(warFlag, {ignoreDestructibleStructures: true});
            if ((hostiles = warFlag.pos.findInRange(FIND_STRUCTURES, 10)).length > 0) {
                //creep.sayRoutine('engineer');
                creep.attack(hostiles[0]); }
        } else {
            //if(creep.pos.getRangeTo(warFlag) > distance)
            // creep.moveTo(warFlag);
            var hostiles = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 15, {filter: (structure) =>
                {return (structure.structureType == StructureTower)}
            });
            if (hostiles.length > 0) {
                //creep.sayRoutine('engineer');
                creep.attack(creep.pos.findClosestByRange(hostiles)); 
            } else if ((hostiles = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 15)).length > 0) {
                //creep.sayRoutine('engineer');
                creep.attack(creep.pos.findClosestByRange(hostiles)); 
            } 
        }
    }
};

var rolePaladin = {
    run:function(creep, distance) {
        if(creep.spawning) {return; }
        var warFlag = Game.flags['war'];
        if(!warFlag) return;
        if (warFlag.memory.forceMov = true) {
            creep.moveTo(warFlag, {ignoreDestructibleStructures: true});
        }
        var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (object) => {
                return object.hits < object.hitsMax;
            }
        });
        creep.moveTo(warFlag); 
        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                creep.rangedHeal(target);
            }
        }
    }
};



var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.spawning) {return; }
       creep.cycleCheck();
       var mine = Game.getObjectById(creep.memory.mine);
       if (creep.room !== mine.room) {
            creep.moveTo(_.find(Game.flags, function(f) {return f.memory == creep.memory.mine;}));
       } else if (creep.memory.cycle) {
            if ((target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)) && creep.pos.getRangeTo(target) < 20 && target.amount >= 100) {
                
            } else if ((target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            ((structure.structureType == STRUCTURE_CONTAINER
                            || structure.structureType == STRUCTURE_STORAGE) && 
                                structure.store[RESOURCE_ENERGY] >= creep.carryCapacity)
                            || structure.structureType == STRUCTURE_LINK && structure.energy >= creep.carryCapacity
                                ) } } ) ) ) {
            } else {
                target = Game.getObjectById(creep.memory.mine);
            }
            if (creep.take(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target); }
        } else {
            var targets = 0, containers, dispensers;
            if ((targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            ((structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER)
                                && structure.energy < structure.energyCapacity) 
                                ) } } ) ).length > 0 ) {
                target = creep.pos.findClosestByRange(targets);
                if(creep.give(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target); 
                }
            } else if(target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)) {
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
            } else if((targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (structure) => structure.hits < structure.hitsMax * 0.8 && structure.hits < 200000
                })).length > 0) {
                creep.repair(targets[0]); 
            } else roleUpgrader.run(creep);
        }
        roleMaintainer.run(creep);
    }
};

module.exports = {  roleMiner, roleRemoteMiner, roleHauler, roleBuilder, roleClaimer , roleUpgrader, roleOldUpgrader, roleWarrior, roleEngineer, rolePaladin, roleHarvester };