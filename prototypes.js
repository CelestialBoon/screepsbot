/**
 * Created by Celestial on 30/07/2016.
 */
var mineList = require('resource.list').mines;
var mineralList = require('resource.list').minerals;
var controllerList = require ('resource.list').controllers;

module.exports = function() {
    //could possibly be used with 2 parameters in case of build/upgrade
    Creep.prototype.give = function(target, resource) {
        let result;
    
        if(target instanceof ConstructionSite)
            result = this.build(target);
    
        else if(target instanceof StructureController)
            result = this.upgradeController(target);
    
        else if(target instanceof Structure || target instanceof Creep)
            result = this.transfer(target, resource);
    
        else result = false;
    
        return result;
    };
    
    
    Creep.prototype.take = function(target, resource) {
        let result;
    
        if(target instanceof Source || target instanceof Mineral)
            result = this.harvest(target);
    
        else if(target instanceof Resource)
            result = this.pickup(target);
    
        else if(target instanceof Structure)
            result = this.withdraw(target, resource);
    
        return result;
    };
    
    Creep.prototype.dump = function(position) {
    //deposit everything, on ground or on position's structure
    };
    
    Creep.prototype.gather = function() {
    //take every pickup near in range 1
    };
    
    let oldCreepAttack = Creep.prototype.attack;
    Creep.prototype.attack = function ( target ) {
    
        if(this.getActiveBodyparts(RANGED_ATTACK)) {
            if (this.pos.inRangeTo(target, 1)) {
                this.rangedMassAttack();
            } else {
                this.rangedAttack(target);
            }
        }
        let rampart;
        if(
            (target instanceof Structure
                || (target && (rampart = _.find(target.pos.lookFor(LOOK_STRUCTURES), (str) => {return str.structureType === STRUCTURE_RAMPART}))))
            && this.getActiveBodyparts(WORK) * DISMANTLE_POWER > this.getActiveBodyparts(ATTACK) * ATTACK_POWER
        ) {
            if(rampart) {
                return this.dismantle(rampart);
            } else {
                return this.dismantle(target);
            }
        } else {
            return oldCreepAttack.call(this, target);
        }
    };
    
    Creep.prototype.cycleCheck = function() {
        if(!this.memory.cycle && _.sum(this.carry) === 0) {
            this.memory.cycle = true;
        }
        if(this.memory.cycle && _.sum(this.carry) === this.carryCapacity) {
            this.memory.cycle = false;
        }
    };
    
    Creep.prototype.getRecycled = function() {
        let spawn;
        if (this.room.controller && this.room.controller.my && (spawn = _.find(this.room.find(FIND_MY_STRUCTURES), (str) => {return str.structureType == STRUCTURE_SPAWN}))) {
            if (this.pos.getRangeTo(spawn) > 1) {
                this.moveTo(spawn);
            } else {
                spawn.recycleCreep(this);
            }
        } else this.moveTo(Game.spawns.Spawn1);
    };
    
    
    
    
    
    //Room.prototype.mineral = this ? this.find(FIND_MINERALS)[0] || undefined;
    
    Room.prototype.pushStack = function (creepString) {
        this.memory.creepStack.push(creepString);
    };
    
    Room.prototype.updateIntel = function () {
    //todo: centerRoom, portal, reservation,
        if (this === undefined) { return false; }
    
        let sources = this.find(FIND_SOURCES);
        let mineral = this.find(FIND_MINERALS)[0];
        let structures = this.find(FIND_STRUCTURES);
        let controller = _.find(structures, (str) => {return str.structureType === STRUCTURE_CONTROLLER});
        let spawns = _.filter(structures, (str) => {return str.structureType === STRUCTURE_SPAWN});
        let towers = _.filter(structures, (str) => {return str.structureType === STRUCTURE_TOWER});
    
        function getIntel(target) {
            return {'id': target.id, 'pos': target.pos};
        }
    
        function setProperty(key, value_) {
            Object.defineProperty(Memory.room[this.roomName], key, {
                value: value_,
                enumerable: true,
                writable: true
            });
        }
    
        setProperty('sources',sources.forEach((source) => getIntel(source)));
        setProperty('mineral', getIntel(mineral));
        setProperty('controller', getIntel(controller));
        setProperty('owner', (controller.owner ? controller.owner : null));
        setProperty('spawns', getIntel(spawns));
        setProperty('towers', towers.forEach((tower) => getIntel(tower)));
        return true;
    };
    
    
    
    
    
    
    
    StructureTower.prototype.run = function(invaders) {
        let targets;
        if ((targets = this.room.find(FIND_HOSTILE_CREEPS)).length > 0) {
            if((this.pos.findInRange(targets, 14)).length > 0) {
            return this.attack(this.pos.findClosestByRange(targets));
            }
        } else if(!invaders && (targets = _.filter(this.room.find(FIND_MY_CREEPS), (cr => (cr.hits <= cr.hitsMax - 100)))).length > 0) {
             return this.heal(this.pos.findClosestByRange(targets));
        } else if(!invaders && (targets = this.room.find(FIND_STRUCTURES, {filter:
                (structure) => (structure.hits < structure.hitsMax * 0.2 && structure.hits < 6000) || (structure.hitsMax < 50000 && structure.hits < structure.hitsMax * 0.3)})).length > 0 && this.energy > 700) {
            return this.repair(this.pos.findClosestByRange(targets));
        }
    };
    
    
    
    
    
    StructureLink.prototype.fillTransfer = function (target) {
    //console.log('aaaaa');
    
        if(this.cooldown === 0 && target.energy < target.energyCapacity && (this.energy >= target.energyCapacity - target.energy)) {
            return this.transferEnergy(target);
        } else return false;
    };
    
    
    
    
    
    
    Spawn.prototype.handleSpawnStack = function() {
        if(this.room.memory.creepStack === undefined) { this.room.memory.creepStack = [] }
        let creepStack = this.room.memory.creepStack,
            body, newName, options;
    
        switch(creepStack[0]) {
            case 'miner0':
                body = [WORK,WORK,WORK,WORK,WORK,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineList[0][0], x: 42, y:39, room:'W48N33'});
                    console.log('Spawning new miner02: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'miner02':
                body = [WORK,WORK,WORK,WORK,WORK,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineralList[0], x: 31, y:33, room:'W48N33'});
                    console.log('Spawning new miner02: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'miner10':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineList[1][0], x: 36, y:34, room:'W49N33'});
                    console.log('Spawning new miner10: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'miner11':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineList[1][1], x: 8, y:29, room:'W49N33'});
                    console.log('Spawning new miner11: ' + newName);
                    creepStack.shift();
                }
                break;
                
            case 'miner20':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,
                    MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineList[2][0], x: 4, y:40, room:'W49N32'});
                    console.log('Spawning new miner20: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'miner21':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,
                    MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineList[2][1], x: 19, y:37, room:'W49N32'});
                    console.log('Spawning new miner21: ' + newName);
                    creepStack.shift();
                }
                break;
                
                case 'minerO':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineralList[0], x: 32, y:32, room:'W48N33'});
                    console.log('Spawning new minerO: ' + newName);
                    creepStack.shift();
                }
                break;
                
                case 'minerH':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineralList[1], x: 18, y:16, room:'W49N33'});
                    console.log('Spawning new minerH: ' + newName);
                    creepStack.shift();
                }
                break;
                
                case 'minerK':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineralList[2], x: 31, y:17, room:'W49N32'});
                    console.log('Spawning new minerK: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'harvester10':
                body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'harvester', mine: mineList[1][0]});
                    console.log('Spawning new harvester10: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'harvester11':
                body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'harvester', mine: mineList[1][1]});
                    console.log('Spawning new harvester11: ' + newName);
                    creepStack.shift();
                }
                break;
    
    
            case 'harvester20':
                body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'harvester', mine: mineList[2][0]});
                    console.log('Spawning new harvester20: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'harvester21':
                body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'harvester', mine: mineList[2][1]});
                    console.log('Spawning new harvester21: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'remoteminer10':
                body = [WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'remoteminer', mine: mineList[1][0], storage: '578be1dd2d2038d620adc77b'});
                    console.log('Spawning new remoteminer10: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'remoteminer11':
                body = [WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'remoteminer', mine: mineList[1][1], storage: '578be1dd2d2038d620adc77b'});
                    console.log('Spawning new remoteminer11: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'remoteminer30':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'remoteminer', mine: mineList[3][0], storage: '5793c9e1e2fdeb125e254423'});
                    console.log('Spawning new remoteminer30: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'remoteminer40':
                body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'remoteminer', mine: mineList[4][0], storage: '5796188b0c38ea9068c3ee6d'});
                    console.log('Spawning new remoteminer40: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'remoteminer50':
                body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'remoteminer', mine: mineList[5][0], storage: '5796188b0c38ea9068c3ee6d'});
                    console.log('Spawning new remoteminer50: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'hauler':
                body = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'hauler'});
                    console.log('Spawning new hauler: ' + newName);
                    creepStack.shift();
                }
                break;
                
                case 'haulermini':
                body = [CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'hauler'});
                    console.log('Spawning new haulermini: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'maintainer':
                body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'maintainer'});
                    console.log('Spawning new maintainer: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'builder':
                body = [WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'builder'});
                    console.log('Spawning new builder: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'claimer1':
                body = [CLAIM,CLAIM,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'claimer', controller: controllerList[1]});
                    console.log('Spawning new claimer1: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'claimer2':
                body = [CLAIM,CLAIM,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'claimer', controller: controllerList[2]});
                    console.log('Spawning new claimer2: ' + newName);
                    creepStack.shift();
                }
                break;
                
                case 'claimer3':
                body = [CLAIM,
                    MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'claimer', controller: controllerList[3], claiming: true});
                    console.log('Spawning new claimer3: ' + newName);
                    creepStack.shift();
                }
                break;
                
                case 'claimer4':
                body = [CLAIM,CLAIM,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'claimer', controller: controllerList[4], claiming: false});
                    console.log('Spawning new claimer4: ' + newName);
                    creepStack.shift();
                }
                break;
                
                case 'claimer5':
                body = [CLAIM,CLAIM,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'claimer', controller: controllerList[5], claiming: false});
                    console.log('Spawning new claimer5: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'upgrader0':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'upgrader', controller: '577b92980f9d51615fa46c9e'});
                    console.log('Spawning new upgrader0: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'upgrader1':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'upgrader', controller: '577b928b0f9d51615fa46b5e'});
                    console.log('Spawning new upgrader1: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'upgrader2':
                body = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'upgrader', controller: '577b928b0f9d51615fa46b62'});
                    console.log('Spawning new upgrader2: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'upgrader1bis':
                body = [WORK,WORK,WORK,
                    CARRY,CARRY,
                    MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'upgrader', controller: '577b928b0f9d51615fa46b5e'});
                    console.log('Spawning new upgrader1bis: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'oldupgrader':
                body = Array(10).fill(WORK).concat([CARRY]).concat(Array(3).fill(MOVE));
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'oldupgrader', mine: '577b92980f9d51615fa46c9f'});
                    console.log('Spawning new oldupgrader0: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'basicupgrader':
                body = [WORK,
                    CARRY,
                    MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'upgrader'});
                    console.log('Spawning new upgrader: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'defender': 
                body = [TOUGH,TOUGH,TOUGH,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    ATTACK,ATTACK,ATTACK];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'defender'});
                    console.log('Spawning new defender: ' + newName);
                    creepStack.shift();
                }
                break;
    
            //cost 1330
            //86 ticks
            case 'warrior6':
                body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'warrior'});
                    console.log('Spawning new warrior: ' + newName);
                    creepStack.shift();
                }
                break;
                
            case 'warrior7':
                body = Array(25).fill(MOVE).concat(Array(25).fill(ATTACK));
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'warrior'});
                    console.log('Spawning new warrior: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'warriormini':
                body = [TOUGH,TOUGH,TOUGH,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    ATTACK,ATTACK,ATTACK];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'warrior'});
                    console.log('Spawning new warrior: ' + newName);
                    creepStack.shift();
                }
                break;
    
            //cost 930
            //48 ticks
            case 'engineer6':
                body = [TOUGH,TOUGH,TOUGH,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    WORK,WORK,WORK,WORK,WORK,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'engineer'});
                    console.log('Spawning new siege engineer: ' + newName);
                    creepStack.shift();
                }
                break;
                
            case 'engineer7':
                body = Array(25).fill(MOVE).concat(Array(25).fill(WORK));
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'engineer'});
                    console.log('Spawning new siege engineer: ' + newName);
                    creepStack.shift();
                }
                break;
    
            //cost 1800
            //60 ticks
            case 'paladin6':
                body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    HEAL,HEAL,HEAL,HEAL,HEAL];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'paladin'});
                    console.log('Spawning new paladin: ' + newName);
                    creepStack.shift();
                }
                break;
                
            case 'paladin7':
                body = Array(20).fill(MOVE).concat(Array(2).fill(CARRY).concat(Array(18).fill(HEAL)));
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'paladin', trap: true});
                    console.log('Spawning new paladin: ' + newName);
                    creepStack.shift();
                }
                break;
    
            //not implemented yet
            case 'cleric':
                body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                    HEAL,HEAL,HEAL,HEAL,HEAL,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'cleric'});
                    console.log('Spawning new cleric: ' + newName);
                    creepStack.shift();
                }
                break;
    
            //cost 1230
            //48 ticks
            case 'archer':
                body = [TOUGH,TOUGH,TOUGH,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'archer'});
                    console.log('Spawning new archer: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'basicminer20':
                body = [WORK,WORK,
                    MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineList[2][0], x: 4, y:40, room:'W49N32'});
                    console.log('Spawning new basicminer20: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'basicminer21':
                body = [WORK,WORK,
                    MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'miner', mine: mineList[2][1], x: 19, y:37, room:'W49N32'});
                    console.log('Spawning new basicminer20: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case 'basichauler':
                body = [CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE];
                if (!this.canCreateCreep(body)) {
                    newName = this.createCreep(body
                        , undefined, {role: 'hauler'});
                    console.log('Spawning new hauler: ' + newName);
                    creepStack.shift();
                }
                break;
    
            case undefined:
                break;
    
            default:
                console.log('WARNING: Unrecognized name in spawn queue: ' + creepStack.shift());
                break;
    
        }
    };
}



