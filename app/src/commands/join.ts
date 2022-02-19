import Discord from 'discord.js';
import { VoiceConnection } from '@discordjs/voice';
import { getSubscription, Subscription } from '../bot';
import { isInVoice } from '../tools';
import { Command } from './command';

export const JoinCommand : Command = {
    name: 'join',
    description: 'Makes bot join yours voice channel.',
    aliases: ['j', 'enter', 'come'],
    execute: join
};

function join(message: Discord.Message) : VoiceConnection {
    if (!isInVoice(message)) {
        message.reply('You must be in voice channel to do that.');
        return null;
    }

    const bot : Subscription = getSubscription(message);
    const userVoiceChannel = message.member.voice.channel;
    const permissions = userVoiceChannel.permissionsFor(message.client.user);

    if(bot.isInVoiceChannel(message)) {
        message.reply('Bot is already in your voice channel.')
        return null;
    }

    if (!permissions.has('CONNECT')) {
        message.reply("I don't have permission to connect to this channel.");
        return null;
    }
    if (!permissions.has('SPEAK')) {
        message.reply("I don't have permission to speak in this channel.");
        return null;
    }

    bot.disconnectFromVoiceChannel();

    const connection = bot.connectToVoiceChannel(message);

    if (!connection) {
        message.reply("I can't join your channel");
    }

    bot.debug('Joined to new VC');

    return connection;
}
