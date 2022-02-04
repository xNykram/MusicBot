import Discord from 'discord.js'

import { Command } from './command';
import { Subscription, getSubscription } from '../bot';

export const StopCommand : Command = {
    name: 'stop',
    description: 'Forces bot to stop playing music and leave.',
    aliases: ['s', 'st', 'end'],
    execute: stopBot,
    requireVoiceChannel: true
};

function stopBot(message: Discord.Message) {
    const bot: Subscription = getSubscription(message);
    bot.stop();
}
