require('prototypes')();

var crRoles = {
    roleMaintainer: {
        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            if (creep.carry.energy > 0) {
                let targets;
                if ((targets = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)).length > 0) {
                    creep.cancelOrder('move');
                    creep.build(creep.pos.findClosestByRange(targets));
                } else {
                    if ((targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                            filter: (structure) => {
                                return (structure.hits < structure.hitsMax * 0.9 && structure.hits < 250000)
                            }
                        })).length > 0) {
                        creep.repair(creep.pos.findClosestByRange(targets));
                    }
                }
            }
        }
    },

    roleMiner: {
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            //custom cycleCheck 
            crRoles.roleMaintainer.run(creep);
            var mine = Game.getObjectById(creep.memory.mine);
            var position = new RoomPosition(creep.memory.x, creep.memory.y, creep.memory.room);
            if (creep.pos !== position) {
                creep.moveTo(position);
            }
            creep.harvest(mine);
            let targets;
            if (creep.carryCapacity > 0 && _.sum(creep.carry) === creep.carryCapacity && (targets = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                    filter: (str) => {
                        return str.structureType == STRUCTURE_LINK
                    }
                })).length > 0) {
                creep.give(targets[0], RESOURCE_ENERGY);
            }
            if (creep.carry.energy > 0 &&
                    (targets = _.filter
                        (creep.pos.findInRange(FIND_MY_CREEPS, 1), 
                            c => c.memory.role === 'hauler' && (
                                (_.sum(creep.carry) === creep.carryCapacity && _.sum(c.carry) < c.carryCapacity) || (_.sum(creep.carry) > c.carryCapacity - _.sum(c.carry))
                                    ))).length > 0) {
                creep.give(targets[0], RESOURCE_ENERGY);
            }
                
        }
    },


    roleRemoteMiner: {
        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            creep.cycleCheck();
            var mine = Game.getObjectById(creep.memory.mine);
            var store = Game.getObjectById(creep.memory.storage);
    
            var dropped, dispenser;
            if (creep.memory.cycle) {
                if ((dropped = creep.pos.findInRange(FIND_DROPPED_ENERGY, 5)).length > 0) {
                    if (creep.take(dropped[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dropped[0]);
                    }
                } else if (dispenser = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: (structure) => {
                            return (
                            (structure.structureType == STRUCTURE_CONTAINER)
                            && structure.store[RESOURCE_ENERGY] > 0 )
                        }
                    }).length > 0) {
                    if (creep.take(dispenser, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dispenser);
                    }
                }
    
                if (mine) {
                    if (creep.take(mine, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(mine, {reusePath: 20});
                    }
                } else {
                    creep.moveTo(_.find(Game.flags, function (f) {
                        return (f.memory == creep.memory.mine)
                    }), {reusePath: 20})
                    //creep.moveTo(Game.flags['Mine10']);
                }
            } else {
                crRoles.roleMaintainer.run(creep);

                if(creep.pos.roomName !== store.pos.roomName) { creep.moveTo(store); 
                    
                } else {
    
                    var target = creep.pos.findClosestByRange(_.filter(creep.room.find(FIND_STRUCTURES), s => s.structureType === STRUCTURE_LINK || s == store));
                    var given = creep.give(target, RESOURCE_ENERGY);
                    if (given == ERR_NOT_IN_RANGE || given == ERR_INVALID_TARGET) {
                        creep.moveTo(store, {reusePath: 20});
                    }
                    crRoles.roleMaintainer.run(creep);
                }
            }
        }
    },

    roleHauler: {
    /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            creep.cycleCheck();
            let target, tar, storage, mineral,
                resource = RESOURCE_ENERGY;
                mineralFlags = _.filter(Game.flags, f => f.pos.roomName == creep.pos.roomName && f.memory.mineralRequest);
            if(mineralFlags.length > 0) { mineral = mineralFlags[0].memory.mineralRequest; }
    
            if (creep.memory.cycle) {
                if ((target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)) && target.amount > 100 && creep.pos.getRangeTo(target) < 20) {
                } else if (target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                            (structure.structureType == STRUCTURE_CONTAINER)
                            && _.sum(structure.store) >= creep.carryCapacity - _.sum(creep.carry)
                            || (creep.room.memory.linkStorageReceive === true && structure.structureType == STRUCTURE_LINK
                            && (structure.pos.getRangeTo(structure.room.storage) < 4) && structure.energy >= creep.carryCapacity)
                            || (structure.structureType === STRUCTURE_TERMINAL && structure.store.energy > 60000)
                            )
                        }
                    })) {
                } else target = creep.room.storage;
                if(target && target.structureType === STRUCTURE_CONTAINER) {
                    for(let stuff in target.store) {
                        resource = stuff;
                        if(target.store.stuff > 0) break;
                    }
                } else if (target && target.structureType === STRUCTURE_STORAGE) {
                    if (mineral !== undefined && target.store[mineral] !== undefined) {
                        resource = mineral;
                    } else resource = RESOURCE_ENERGY;
                }
                //console.log(resource);
                if (creep.take(target, resource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                for (let carried in creep.carry) {
                    if (carried !== 'energy') {
                        if(mineral === carried) {
                            if (creep.give(creep.room.terminal, carried) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.terminal);
                            }
                        } else {
                            if (creep.give(creep.room.storage, carried) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.storage);
                            }
                        }
                        break;
                    } else {
                        if ((target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                                filter: (structure) => {
                                    return (
                                        ((structure.structureType == STRUCTURE_EXTENSION ||
                                        structure.structureType == STRUCTURE_SPAWN ||
                                        structure.structureType == STRUCTURE_TOWER)
                                        && structure.energy < structure.energyCapacity)
                                    )
                                }
                            }))) {
                        } else if((target = creep.room.terminal) && creep.room.terminal.store.energy < 50000) {
                        } else if (target = _.find(creep.room.find(FIND_MY_STRUCTURES), function (structure) {
                                return structure.room.memory.linkStorageReceive === false && structure.structureType == STRUCTURE_LINK
                                    && structure.pos.getRangeTo(structure.room.storage) < 4 && structure.energy < structure.energyCapacity
                            })) {
                        } else target = creep.room.storage;
                        if (creep.give(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        } else if (creep.carry.energy > target.energyCapacity - target.energy) {
                            creep.moveTo(creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                                filter: (structure) => {
                                    return (
                                        ((structure.structureType == STRUCTURE_EXTENSION ||
                                        structure.structureType == STRUCTURE_SPAWN ||
                                        structure.structureType == STRUCTURE_TOWER)
                                        && structure.energy < structure.energyCapacity && structure !== target)
                                    )
                                }
                            }));
                        }
                    }
                }
            }
        }
    },


    roleBuilder: {
        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            creep.cycleCheck();
            var target;
            if (creep.memory.cycle) {
                if (target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                            ((structure.structureType === STRUCTURE_STORAGE || structure.structureType == STRUCTURE_CONTAINER)
                            && structure.store[RESOURCE_ENERGY] >= creep.carryCapacity )
                            || ((structure.structureType == STRUCTURE_LINK)
                            && (structure.pos.getRangeTo(structure.room.storage) < 4) && (structure.energy > 0)))
                        }
                    })) {
                    if (creep.take(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            } else {
                if (target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    if (target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.hits < structure.hitsMax * 0.8 && structure.hits < 200000)
                            }
                        })) {
                        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else crRoles.roleHauler.run(creep);
                }
            }
        }
    },

    roleRemoteBuilder: {

        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            if (creep.pos.roomName !== creep.memory.roomName) {
                creep.moveTo(new RoomPosition(creep.memory.x, creep.memory.y, Game.rooms[creep.memory.roomName]));
            } else {
                creep.cycleCheck();

                if (creep.memory.cycle) {
                    var mine = Game.GetObjectById(creep.memory.mine);
                    if (creep.harvest(mine) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(mine);
                    }
                } else {
                    if (target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)) {
                        if (creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else {
                        if (target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.hits < structure.hitsMax * 0.8 && structure.hits < 200000)
                                }
                            })) {
                            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        }
                    }
                }
            }
        }
    },

    roleClaimer: {
        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            var controller = Game.getObjectById(creep.memory.controller);
            if (controller) {
                if (creep.memory.claiming) {
                    if (creep.claimController(controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controller, {reusePath: 20});
                    }
                } else {
                    if (creep.reserveController(controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controller, {reusePath: 20});
                    }
                }
            } else {
                creep.moveTo(_.find(Game.flags, function (f) {
                    return f.memory.id == creep.memory.controller;
                }), {reusePath: 20});
            }
        }
    },


    roleUpgrader: {
        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            creep.cycleCheck();
            let controller = Game.getObjectById(creep.memory.controller);
            if (!controller) controller = creep.room.controller;
            let target, dropped;
            if (creep.memory.cycle) {
                if ((dropped = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1)).length > 0) {
                    creep.take(dropped[0], RESOURCE_ENERGY);
                } else if ((target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                            (structure.structureType == STRUCTURE_LINK) && structure.energy > 0 && creep.pos.isNearTo(structure)
                            )
                        }
                    }))) {
                } else if (target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                            (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
                            && structure.store[RESOURCE_ENERGY] >= creep.carryCapacity
                            )
                        }
                    })) {
                } else {
                    target = creep.pos.findClosestByRange(FIND_SOURCES, {
                        filter: (patch) => {
                            return patch.energy > 0
                        }
                    });
                }

                if (creep.take(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
                crRoles.roleMaintainer.run(creep);
            }
        }
    },

    roleOldUpgrader: {
        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            var mine = Game.getObjectById(creep.memory.mine);
          
            var dropped = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
            if (creep.pos.getRangeTo(dropped) < 2) {
                mine = dropped;
            }
            if (creep.take(mine, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(mine);
            }
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            if(creep.carry.energy > creep.carryCapacity / 2) {
                creep.cancelOrder('harvest');
            }
        }
    },


    roleDefender: {
        run: function (creep, roomName) {
            if (creep.spawning) {
                return;
            }
            if (roomName === undefined) {
                Memory.defenderSpawned = false;
                creep.memory.role = '';
            } else {
                let roomCenter = new RoomPosition(25, 25, roomName);
                let targets;
                if (Game.rooms[roomName] === undefined) {
                    creep.moveTo(roomCenter);
                } else if ((targets = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS)).length > 0) {
                    let target = creep.pos.findClosestByRange(targets);
                    if (creep.pos.roomName !== roomName) {
                        creep.moveTo(roomCenter);
                    } else if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        }
    },


    roleWarrior: {
        run: function (creep, distance) {
            if (creep.spawning) {
                return;
            }
            var warFlag = Game.flags['war'];
            if (!warFlag) return;
            
            var hostiles, towers;
            if (warFlag.memory.forceMov) {
                 creep.moveTo(warFlag, {ignoreDestructibleStructures: true});
            } else {
                if (creep.pos.roomName !== warFlag.pos.roomName || creep.pos.getRangeTo(warFlag) > distance) {
                    creep.moveTo(warFlag);
                }
                if(creep.pos.roomName == warFlag.pos.roomName) {
                    var hostiles = warFlag.pos.findInRange(FIND_HOSTILE_CREEPS, distance + 2);
                    if (hostiles.length > 0) {
                        hostile = creep.pos.findClosestByRange(hostiles);
                        creep.moveTo(hostile);
                        creep.attack(hostile);
                    } else if ((hostiles = warFlag.pos.findInRange(FIND_HOSTILE_STRUCTURES, distance + 2, {filter: s => s.structureType !== STRUCTURE_CONTROLLER})).length > 0) {
                        hostile = creep.pos.findClosestByRange(hostiles);
                        creep.moveTo(hostile);
                        creep.attack(hostile);
                    }
                }
            }
        }
    },

    roleEngineer: {
        run: function (creep, distance) {
            if (creep.spawning) {
                return;
            }
            var warFlag = Game.flags['war'];
            if (!warFlag) return;
            
            var hostiles, towers;
            if (warFlag.memory.forceMov == true) {
                creep.moveTo(warFlag, {ignoreDestructibleStructures: true});
                if((hostiles = warFlag.pos.lookFor(LOOK_STRUCTURES)).length > 0) {
                    creep.dismantle(hostiles[0]);
                }
            } else {
                if(creep.pos.roomName !== warFlag.pos.roomName || creep.pos.getRangeTo(warFlag) > distance) {
                    creep.moveTo(warFlag);
                }
                if(creep.pos.roomName == warFlag.pos.roomName) {
                    var hostiles = warFlag.pos.findInRange(FIND_HOSTILE_STRUCTURES, distance + 5, {
                        filter: (structure) => {
                            return (structure.structureType == StructureTower)
                        }
                    });
                    var hostile;
                    if (hostiles.length > 0) {
                        hostile = creep.pos.findClosestByRange(hostiles);
                        creep.moveTo(hostile);
                        creep.dismantle(hostile);
                    } else if ((hostiles = warFlag.pos.findInRange(FIND_HOSTILE_STRUCTURES, distance + 3, {filter: s => s.structureType !== STRUCTURE_CONTROLLER})).length > 0) {
                        hostile = creep.pos.findClosestByRange(hostiles);
                        creep.moveTo(hostile);
                        creep.dismantle(hostile);
                    }
                }
            }
        }
    },

    rolePaladin: {
        run: function (creep, distance) {
            if (creep.spawning) {
                return;
            }
            if(creep.memory.trap) {
                if(creep.take(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
                if(_.sum(creep.carry) === creep.carryCapacity) {
                    creep.memory.trap = false;
                }
            } else {
                var warFlag = Game.flags['war'];
                if (!warFlag) return;
                
                if (warFlag.memory.forceMov == true) {
                    if(creep.pos.roomName !== warFlag.pos.roomName || creep.pos.getRangeTo(warFlag) > distance) {
                    creep.moveTo(warFlag
                    //{ignoreDestructibleStructures: true}
                    );
                    }
                } else {
                    creep.moveTo(warFlag);
                }
                
                if(creep.memory.trap && creep.pos == warFlag.pos) {
                    creep.drop(RESOURCE_ENERGY);
                    creep.memory.trap = false;
                }
                var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (object) => {
                        return object.hits < object.hitsMax;
                    }
                });
                if (target) {
                    if (creep.heal(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                        
                        creep.rangedHeal(target);
                    }
                }
            }
        }
    },


    roleHarvester: {
        /** @param {Creep} creep **/
        run: function (creep) {
            if (creep.spawning) {
                return;
            }
            creep.cycleCheck();
            var mine = Game.getObjectById(creep.memory.mine);
            if (creep.room !== mine.room) {
                creep.moveTo(_.find(Game.flags, function (f) {
                    return f.memory == creep.memory.mine;
                }));
            } else if (creep.memory.cycle) {
                if ((target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY)) && creep.pos.getRangeTo(target) < 20 && target.amount >= 100 && target.resourceType === RESOURCE_ENERGY) {

                } else if ((target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                            ((structure.structureType == STRUCTURE_CONTAINER
                            || structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store[RESOURCE_ENERGY] >= creep.carryCapacity)
                            || structure.structureType == STRUCTURE_LINK && structure.energy >= creep.carryCapacity
                            )
                        }
                    }) )) {
                } else {
                    target = Game.getObjectById(creep.memory.mine);
                }
                if (creep.take(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                var targets = 0, containers, dispensers;
                if ((targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                ((structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER)
                                && structure.energy < structure.energyCapacity)
                            )
                        }
                    }) ).length > 0) {
                    target = creep.pos.findClosestByRange(targets);
                    if (creep.give(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else if (target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else if ((targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: (structure) => structure.hits < structure.hitsMax * 0.8 && structure.hits < 200000
                    })).length > 0) {
                    creep.repair(targets[0]);
                } else crRoles.roleUpgrader.run(creep);
            }
            crRoles.roleMaintainer.run(creep);
        }
    }
};

module.exports = crRoles;
