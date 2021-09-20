const { Subscription, getSubscription } = require('../subscription.js'); 
const { AudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name:'skip',
    description: 'Skips given amount of tracks in queue',
    execute: skip
}

async function skip(message, args){
    const sub = getSubscription(message, true);
    const queue = sub.queue;
    const currentSong = sub.currentSong;
    const player = sub.audioPlayer;
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
    const playerStatus = player.state.status;
     
    if(playerStatus !== AudioPlayerStatus.Idle) 
    {
        player.stop();
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
