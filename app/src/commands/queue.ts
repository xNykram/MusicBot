import Discord from 'discord.js';

import { Command } from './command';
import { Subscription, getSubscription } from '../bot';

export const QueueCommand : Command = {
    name: 'queue',
    description: 'Shows tracks queue',
    aliases: ['q', 'tracks', 'songs', 'list'],
    execute: showQueue
};

function showQueue(message: Discord.Message) {
    const bot: Subscription = getSubscription(message);
    const currentSong = bot.currentSong;
    const queue = bot.queue;
    let buffer = 'Current queue:\n'
    if (currentSong)
        buffer += `Now playing ${currentSong.title} (${currentSong.duration.timestamp})\n`;
    else
        buffer += '(Music is paused now)\n'
    for (let i = 0; i < queue.length; i++) {
        let title = queue[i].title;
        let timestamp = queue[i].duration.timestamp;
        let songEntry = `${i + 1}. ${title} (${timestamp})\n`
        if((buffer + songEntry).length >= 2000) {
            message.reply(buffer);
            buffer = '';
        }
        buffer += songEntry
    }

    message.reply(buffer);
}

