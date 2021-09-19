const { queues, getCurrentSong } = require('./play.js');

module.exports = {
    name: 'queue',
    description: 'Shows current queue',
    execute: showQueue
}

function showQueue(message, args)
{
    const currentSong = getCurrentSong();
    const queue = queues.get(message.guild.id);
    buffer = 'Current queue:\n'
    if(currentSong != null)
        buffer += `Now playing ${currentSong.title} (${currentSong.duration.timestamp})\n`;
    else
        buffer += '(Music is paused now)'
    for(i = 0; i < queue.length; i++)
    {
        title = queue[i].title;
        timestamp = queue[i].duration.timestamp;
        buffer += `${i+1}. ${title} (${timestamp})\n`
    }
    message.reply(buffer);
}

