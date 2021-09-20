const { Subscription, getSubscription } = require('../subscription.js');

module.exports = {
    name: 'queue',
    description: 'Shows current queue',
    execute: showQueue
}

function showQueue(message, args)
{
    const sub = getSubscription(message, false);
    const currentSong = sub.currentSong;
    const queue = sub.queue;
    buffer = 'Current queue:\n'
    if(currentSong)
        buffer += `Now playing ${currentSong.title} (${currentSong.duration.timestamp})\n`;
    else
        buffer += '(Music is paused now)\n'
    for(i = 0; i < queue.length; i++)
    {
        title = queue[i].title;
        timestamp = queue[i].duration.timestamp;
        buffer += `${i+1}. ${title} (${timestamp})\n`
    }
    message.reply(buffer);
}

