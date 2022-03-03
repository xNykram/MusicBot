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
    if(bot.isInVoiceChannel() && !bot.isInVoiceChannel(message)) {
        message.reply("You need to be in a voice channel with bot to do that");
        return false;
    }
    if (args.length == 0 && !bot.currentSong) {
        message.reply("You need to specify a song to play.");
        return false;
    }
    else if (args.length == 0) {
        if (!bot.isInVoiceChannel()) {
            JoinCommand.execute(message);
        }
        bot.processQueue();
        return;
    }

    const query = args.join(' ');
    const queryId = getIdFromUrl(query);
    let video = null;
    let playlist = null;
    if (queryId == null) {
        let result = await ytSearch(query);
        if (result.videos.length > 0) {
            video = result.videos[0];
        }
    }
    else if (queryId[0] === 'video') {
        video = await ytSearch({ videoId: queryId[1] });
    }
    else if (queryId[0] === 'list') {
        playlist = await ytSearch({ listId: queryId[1] });
    }

    if (!video && !playlist) {
        message.reply("Couldn't find requested query :(");
        return;
    }

    if (!bot.isInVoiceChannel()) {
        bot.debug('Bot is not in VC @ PlayCommand')
        await JoinCommand.execute(message);
    }
    const serverQueue = bot.queue;
    const currentSong = bot.currentSong;

    if (video) {
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
    else if (playlist) {
        message.reply(`Added playlist '${playlist.title}' to queue (${playlist.videos.length} songs).`);
        for (let elem of playlist.videos) {
            const vid = await ytSearch({ videoId: elem.videoId });
            bot.enqueue(vid);
        }
    }
    else {
        message.reply("Couldn't find requested query :(");
    }
}

/**
 * Returns playlist or videid of given url
 * This function return ['list', listId] or ['video', videoId]
 * or null if url is not a vaild
 */
function getIdFromUrl(url: string): string[] {
    let split = url.split('=');
    if (split.length == 0) {
        return null;
    }

    if (split[0].includes('list')) {
        return ['list', split[1]];
    }

    if (split[0].includes('watch?v')) {
        return ['video', split[1]];
    }

    return null;
}
