/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('cr.func');
 * mod.thing == 'a thing'; // true
 */

var crFunc = {
take: function(creep, target, resource) {
    var result;

    if(target instanceof Source || target instanceof Mineral)
    result = creep.harvest(target);
    
    if(target instanceof Resource)
    result = creep.pickup(target);
    
    if(target instanceof OwnedStructure)
    result = creep.withdraw(target, resource);

    return result;
} ,


give: function(creep, target, resource) {
    var result;
    
    if(target instanceof ConstructionSite)
    result = creep.build(target);
    
    else if(target instanceof StructureController)
    result = creep.upgradeController(target);
    
    else if(target instanceof Structure || target instanceof Creep)
    result = creep.transfer(target, resource);
    
    else result = false;
    
    return result;
} ,

attack: function(creep, target, resource) {
        var direction = creep.pos.getDirectionTo(target);
        var distance = creep.pos.getRangeTo(target);
    if (creep.body.includes('RANGED_ATTACK')) {
            creep.rangedAttack(target);
        if(distance < 3 ) {
            var away = distance+4%8+1;
            if(creep.move(away)) if (creep.move(away+1%8+1)) if (creep.move(away-1%8+1)) if (creep.move(away+2%8+1)) if (creep.move(away-2%8+1)) creep.rangedMassAttack();
        } else if (distance > 3) moveTo(target);
    } else {
        if (creep.attack(target) == ERR_NOT_IN_RANGE)
            creep.moveTo(target);
    }
} ,

cycleCheck: function(creep) {
    if(!creep.memory.cycle && creep.carry.energy == 0) {
        creep.memory.cycle = true;
    }
    if(creep.memory.cycle && creep.carry.energy == creep.carryCapacity) {
        creep.memory.cycle = false;
    }
}
};

module.exports = crFunc;