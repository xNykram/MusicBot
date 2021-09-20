const join = require('./join.js');
const leave = require('./leave.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const voice = require('@discordjs/voice');
const { Subscription, getSubscription } = require('../subscription.js');

var connection = null;
var audioPlayer = null;
var subscribe = null;
var currentSong = null;
const queues = new Map();

module.exports = {
    name: 'play',
    description: 'Search and plays a song',
    execute: addToQueue
}

async function addToQueue(message, args){
    if(args.length == 0)
    {
        message.reply("You need to specify a song to play.");
        return false;
    }

    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);

        return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
    }

    const query = args.join(' ');
    const video = await videoFinder(query);

    var subscribe = getSubscription(message, true);

    if(video)
    {
        const serverQueue = subscribe.queue;
        const currentSong = subscribe.currentSong;
        if((serverQueue.length == 0) && (currentSong == null))
        {
            message.reply(`Playing ${video.title} (${video.duration.timestamp})`);
        }
        else
        {
            pos = serverQueue.length;
            message.reply(
                `Added ${video.title} (${video.duration.timestamp}) to queue (pos: ${pos + 1});`
            )
        }
        subscribe.enqueue(video);
    }
    else
    {
        message.reply("Couldn't find requested query :(");
    }
}

