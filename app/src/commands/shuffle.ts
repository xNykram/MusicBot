import Discord from 'discord.js'

import { Command } from './command';
import { Subscription, getSubscription } from '../bot';

export const ShuffleCommand : Command = {
    name: 'shuffle',
    description: 'Mixes up the current queue.',
    aliases: ['shuf'],
    execute: shuffleQueue
};

function shuffleQueue(message: Discord.Message) {
    const bot: Subscription = getSubscription(message);
    const queue = bot.queue;
    if (queue.length < 2){
        message.reply("There must be at least 2 songs in the queue in order to use this command.");
        return false;
    }
    for (let i = 0; i < queue.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    message.reply("The queue was successfully mixed. Type !queue to see the new order of the queue.")

}
