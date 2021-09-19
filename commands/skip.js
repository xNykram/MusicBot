const { queues, getCurrentSong, clearCurrentSong, getPlayer } = require('./play.js');

module.exports = {
    name:'skip',
    description: 'Skips given amount of tracks in queue',
    execute: skip
}

async function skip(message, args){
    const queue = queues.get(message.guild.id);
    const currentSong = getCurrentSong();
    const player = getPlayer();
    if(args.length > 1)
    {
        message.reply('Bad usage. Use !skip [num]'); 
        return false;
    }
    var toSkip = 0;
    if(args.length == 0)
        toSkip = 1;
    else
        toSkip = parseInt(args[0]);
    if(toSkip == NaN || toSkip <= 0)
    {
        message.reply('Bad usage. Use !skip [num]'); 
        return false;
    }
    const total = toSkip;
     
    if(currentSong)
    {
        player.stop(); 
        clearCurrentSong();
        toSkip -= 1; 
    }

    while(queue.length > 0 && toSkip)
    {
        queue.shift();
        toSkip -= 1;
    }

    message.reply(`Skipped ${total - toSkip} songs`);
    return true;
}
