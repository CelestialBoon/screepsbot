/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawn.funs');
 * mod.thing == 'a thing'; // true
 */
//function for dynamically creating workers

function gWorCreep(sRole, name, percWork, percCarry, spawn, energy, roads);

var parts = ']', cost = 0;

roCost = roads ? 0.5 : 1;
coWork = 2 + roCost;
coCarry = 1 + roCost;

var nWork = 0, 
    nCarry = 0, 
    enWork = 0, 
    enCarry = 0;

var done = false, 
    iEnergy = floor(energy/50),
    tot = 0;

while (ceil(tot + coCarry) <= iEnergy) {
    if (ceil(nWork*coWork)*percWork <= ceil(nCarry*coCarry)*percCarry) {
        if(tot + coWork <= iEnergy) {
            nWork++;
            tot += coWork;
        }
    } else { 
        nCarry++;
        tot += coCarry;
    }

    if(ceil(tot + coWork) > iEnergy) && ceil(tot + coCarry <= iEnergy) {
        nCarry++;
        tot += coCarry;
    }
}

var nMove = ceil((work + carry) * (if (roads) 0.5 else 1));

',MOVE'.repeat(nMove).concat(parts);
',CARRY'.repeat(nCarry).concat(parts);
',WORK'.repeat(nWork).concat(parts);
'['.concat(parts.substring(1));

if (name)
    spawn.createCreep(parts, name, { role: sRole });
else
    spawn.createCreep(parts, undefined, { role: sRole });


module.exports = {

};