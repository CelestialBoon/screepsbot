Game.rooms['W48N33'].memory.creepStack.push('builder');
Game.rooms['W49N33'].memory.creepStack.push('miner11');
Game.rooms['W49N32'].memory.creepStack.push('miner30');
//
for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'remoteminer')
        creep.memory.storage = '578be1dd2d2038d620adc77b';}
//


if(creep.room.controller.owner.name !== 'cboon') crFunc.sayRoutine(creep, role);

sayRoutine: function (creep, role) {
    if (creep.memory.sayI === undefined) creep.memory.sayI = 0;
    let sayStr;
    switch (role) {
        case 'attacking': sayStr = 'Bam! Bif! Pow! Smack! Boff! Zlonk! Kapow! Sok! Blap! Whamm! Zok! Crash! Phoomph! Whack! Clank! Zlott! Rrip! Vronk!'; break;
        case 'engineer': sayStr = 'Hello, dont mind me, Im just a simple engineer and Ill just have a brief look at your wares and do a little testing for structural stability, this will just take a minute and will be completely painless!'; break;
        case 'warrior': sayStr = 'NO ESCAPE'; break;
        default: sayStr = 'Im a little teapot short and stout. Here is my handle. Here is my spout. When I get all steamed up, Hear me shout! Just tip me over And pour me out Im a clever teapot, yes its true. Heres an example of what I can do. I can turn my handle to a spout. Just tip me over and pour me out '; break;
    }

    let saySplit = _.split(sayStr.substring(creep.memory.sayI), ' ');
    let sayPart = '', i=0;
    // i gets raised in side
    do {
        let nextWord = saySplit.shift();
        if(nextWord.length + i + 1 < 10) {
            sayPart.push(' ' + nextWord);
            i += nextWord.length + 1;
        } else i = 10;
    } while (i<10);
    creep.say(sayPart, true);
    creep.memory.sayI += sayPart.length + 1;
    if (sayStr.substring(creep.memory.sayI) === '') creep.memory.sayI = 0;
}





how to handle workers?
what if each spawn room had a memory of its contents?

the rest in resource list
run updateroom(roomName) to reload memory
    look for containers, mines, storage, controller, 


    spawn from string

    message[parts_compressed]{options}

    read from this:



split at $, use the first for message, second for body, third for options

concat and split for $
stringify and parse for []
serialize and parse for []

case with name or without

case theyre 3

if(spawn.room.memory.creepStack === undefined) { spawn.room.memory.creepStack = [] }
    var creepStack = spawn.room.memory.creepStack;
    
    var splitCreep = creepStack[0].split('$');
    switch (splitCreep.length) {

    case 0:
    break;
    case 3:
    //begin here
    var message = splitCreep[0];
    var body = splitCreep[1].toLowerCase().split(',');
    var options = JSON.parse(splitCreep[2]);
    break;

    case 4:
    break;
    default:
    break;
    }

    if (!spawn.canCreateCreep(body)) {
        var newName = spawn.createCreep(body
            , undefined, options); 
        console.log('Spawning new ' + message + ': ' + newName);
        creepStack.shift();



        check for energy levels: available and situation


        making a string:

        creepString = name ? message + '$' + body + '$' + options : message + '$' + name + '$' + body + '$' + options;
        pushString



/*
figure out the stringify thing for spawning


spawn things
refactor the spawn so it handles multiple
    gives room, iterates on room spawns

how to handle workers?
what if each spawn room had a memory of its contents?

the rest in resource list
run updateroom(roomName) to reload memory
    look for containers, mines, storage, controller,  etc.






*/
