import { Command } from './command';
import { Subscription, getSubscription } from '../bot';
import { isInVoice } from '../tools';
import Discord from 'discord.js';

export const LeaveCommand : Command = {
    name: 'leave',
    description: 'Forces bot to leave voice channel',
    aliases: ['l', 'le', 'quit'],
    execute: leave
};

function leave(message: Discord.Message) {
    const bot : Subscription = getSubscription(message);
    if ((!isInVoice(message)) || (message.member.voice.channelId !== bot.getVoiceChannel())){
        message.reply("You have to be in a voice channel with the music bot to do that.");
        return false;
    }

    bot.disconnectFromVoiceChannel();
}
