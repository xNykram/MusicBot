import Discord from 'discord.js';

import { Command } from './command';
import { Subscription, getSubscription } from '../bot';
import { AudioPlayerStatus } from '@discordjs/voice';

export const SkipCommand : Command = {
    name: 'skip',
    description: 'Skips given amount of songs',
    aliases: ['s', 'sk', 'next', 'nxt'],
    execute: skip,
    requireVoiceChannel: true
}

async function skip(message: Discord.Message, args: string[]) {
    const bot: Subscription = getSubscription(message);

    const queue = bot.queue;
    const player = bot.audioPlayer;
    if (args.length > 1) {
        message.reply('Bad usage. Use !skip [num]');
        return false;
    }
    var toSkip = 0;
    if (args.length == 0)
        toSkip = 1;
    else
        toSkip = parseInt(args[0]);
    if (toSkip == NaN || toSkip <= 0) {
        message.reply('Bad usage. Use !skip [num]');
        return false;
    }
    const total = toSkip;
    const playerStatus = player.state.status;

    if (playerStatus !== AudioPlayerStatus.Idle) {
        bot.currentSong = null;
        player.stop();
        toSkip -= 1;
    }

    while (queue.length > 0 && toSkip) {
        queue.shift();
        toSkip -= 1;
    }

    message.reply(`Skipped ${total - toSkip} songs`);
    return true;
}
