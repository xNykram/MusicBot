const join = require('./join.js');
const leave = require('./leave.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const voice = require('@discordjs/voice');

var connection = null;
var audioPlayer = null;
var subscribe = null;
var currentSong = null;
const queues = new Map();

module.exports = {
    name: 'play',
    description: 'Search and plays a song',
    queues: queues,
    getCurrentSong() { return currentSong; },
    getPlayer() { return audioPlayer; },
    clearCurrentSong() { currentSong = null; },
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

    connection = voice.getVoiceConnection(message.guild.id);
    const query = args.join(' ');
    const video = await videoFinder(query);

    if(!connection)
    {
        join.execute(message, args);
        connection = voice.getVoiceConnection(message.guild.id);
    }

    if(video)
    {
        var serverQueue = queues.get(message.guild.id);
        if(!serverQueue)
        {
            serverQueue = [];
            queues.set(message.guild.id, serverQueue);
        }
        serverQueue.push(video);
        if((serverQueue.length == 1) && (currentSong == null))
        {
            message.reply(`Playing ${video.title} (${video.duration.timestamp})`);
        }
        else
        {
            pos = serverQueue.length;
            message.reply(
                `Added ${video.title} (${video.duration.timestamp}) to queue (pos: ${pos});`
            )
        }
        if(currentSong == null)
            playNext(message.guild, serverQueue);
    }
    else
    {
        message.reply("Couldn't find requested query :(");
    }
}

async function playNext(guild, queue){
    if(!connection)
        return false;
    if(!audioPlayer)
        audioPlayer = voice.createAudioPlayer();    
    if(!subscribe)
        subscribe = connection.subscribe(audioPlayer);
    if(subscribe.player.state.status !== 'idle')
    {
        return false;
    }
    currentSong = queue.shift();
    const stream = ytdl(currentSong.url, {filter: 'audioonly'});
    const resource = voice.createAudioResource(stream);
    audioPlayer.play(resource);
    subscribe.player.on("stateChange", (oldState, newState) => {
        console.log(`OldState: ${oldState.status}, NewState: ${newState.status}`);
        if(newState.status === 'idle')
        {
            if(queue.length == 0)
            {
                connection.disconnect();
                connection.destroy();
                subscribe.unsubscribe();
                connection = null;
                currentSong = null;
            }
            else
            {
                playNext(guild, queue);
            }
        }
    });
}
