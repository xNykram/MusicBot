const join = require('./join.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const voice = require('@discordjs/voice');

var connection = null;
var audioPlayer = null;

module.exports = {
    name: 'play',
    description: 'Search and plays a song',
    async execute(message, args){
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
        message.reply(query);
        const video = await videoFinder(query);
        

        if(video)
        {
            message.reply(`Playing ${video.title} (${video.duration.timestamp})`);
            if(!connection)
            {
                join.execute(message, args);
            }
            if(!audioPlayer)
            {
                audioPlayer = voice.createAudioPlayer();    
            }
            connection = voice.getVoiceConnection(message.guild.id);
            const stream = ytdl(video.url, {filter: 'audioonly'});
            const resource = voice.createAudioResource(stream);
            audioPlayer.play(resource);
            const subscribe = connection.subscribe(audioPlayer);
        }
        else
        {
            message.reply("Couldn't find requested query.");
        }
        
    }
}
