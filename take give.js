/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('take give');
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
};


give: function(creep, target, resource) {
var result;

if(target instanceof ConstructionSite)
result = creep.build(target);

if(target instanceof OwnedStructure || target instanceof Creep)
result = creep.transfer(target, resource);

if(target instanceof Controller)
result = creep.upgradeController(target);

return result;
};
}

module.exports = { crFunc
};