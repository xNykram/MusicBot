import { Command } from './command';
import { Subscription, getSubscription } from '../bot';
import Discord from 'discord.js';

export const LeaveCommand : Command = {
    name: 'leave',
    description: 'Forces bot to leave voice channel',
    aliases: ['l', 'le', 'quit'],
    execute: leave,
    requireVoiceChannel: true
};

function leave(message: Discord.Message) {
    const bot : Subscription = getSubscription(message);
    bot.disconnectFromVoiceChannel();
}
