import ytSearch from 'yt-search';
import Discord from 'discord.js';

import { Command } from './command';
import { JoinCommand } from './join';
import { Subscription, getSubscription } from '../bot';
import { isInVoice } from '../tools';

export const PlayCommand: Command = {
    name: 'play',
    description: 'Search and plays given song',
    aliases: ['p', 'pl', 'start', 'search'],
    execute: addToQueue
};

async function addToQueue(message: Discord.Message, args: String[]) {
    const bot: Subscription = getSubscription(message);
    if (!isInVoice(message)) {
        message.reply("You need to be in a voice channel to do that.");
        return false;
    }
    if (args.length == 0 && !bot.currentSong) {
        message.reply("You need to specify a song to play.");
        return false;
    }
    else if(args.length == 0){
        if (!bot.isInVoiceChannel()) {
            JoinCommand.execute(message);
        }
        bot.processQueue(); 
        return;
    }

    const videoFinder = async (query: string) => {
        const videoResult = await ytSearch(query);

        return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
    }

    const query = args.join(' ');
    const video = args.length == 0 ? bot.currentSong : await videoFinder(query);

    if (video) {
        if (!bot.isInVoiceChannel()) {
            JoinCommand.execute(message);
        }
        const serverQueue = bot.queue;
        const currentSong = bot.currentSong;
        if ((serverQueue.length == 0) && (currentSong == null)) {
            message.reply(`Playing ${video.title} (${video.duration.timestamp})`);
        }
        else {
            let pos = serverQueue.length;
            message.reply(
                `Added ${video.title} (${video.duration.timestamp}) to queue (pos: ${pos + 1});`
            )
        }
        bot.enqueue(video);
    }
    else {
        message.reply("Couldn't find requested query :(");
    }
}

