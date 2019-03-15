/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower');
 * mod.thing == 'a thing'; // true
 */

var sTower = {
    /** @param {Tower} tower **/
    run: function(tower) {
        var closestHostile;
        if (closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)) {
            if(tower.pos.getRangeTo(closestHostile) < 14)
                tower.attack(closestHostile);
        } else {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax * 0.5 && structure.hits < 3000
            });
            if(closestDamagedStructure && tower.energy > 700) {
                tower.repair(closestDamagedStructure);
            }
        }

    }
}


module.exports = sTower;