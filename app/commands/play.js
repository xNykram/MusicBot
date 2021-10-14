const ytSearch = require('yt-search');
const { getSubscription } = require('../subscription.js');

module.exports = {
    name: 'play',
    description: 'Search and plays a song',
    execute: addToQueue
}

async function addToQueue(message, args) {
    if (args.length == 0) {
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
    if(!subscribe){
        message.reply("Some error occured. Couldn't establish connection to channel:(");
        return false;
    }

    if (video) {
        const serverQueue = subscribe.queue;
        const currentSong = subscribe.currentSong;
        if ((serverQueue.length == 0) && (currentSong == null)) {
            message.reply(`Playing ${video.title} (${video.duration.timestamp})`);
        }
        else {
            pos = serverQueue.length;
            message.reply(
                `Added ${video.title} (${video.duration.timestamp}) to queue (pos: ${pos + 1});`
            )
        }
        subscribe.enqueue(video);
    }
    else {
        message.reply("Couldn't find requested query :(");
    }
}

