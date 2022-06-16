import Discord from 'discord.js'

import { Command } from './command';
import { Subscription, getSubscription } from '../bot';

export const StopCommand : Command = {
    name: 'stop',
    description: 'Forces bot to stop playing music and leave.',
    aliases: ['st', 'end'],
    execute: stopBot,
    requireVoiceChannel: true
};

async function stopBot(message: Discord.Message): Promise<void> {
    const bot: Subscription = getSubscription(message);
    bot.stop();
}
