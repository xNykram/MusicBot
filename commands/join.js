const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    name: 'join',
    description: 'Joins to voice channel.',
    async execute(message, args){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel)
        {
            message.reply('You must be in voice channel to do that.');
            return false
        }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT'))
        {
            message.reply("I don't have permission to connect to this channel.");
            return false;
        }
        if(!permissions.has('SPEAK'))
        {
            message.reply("I don't have permission to speak in this channel.");
            return false;
        }
        const connection = await joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator});

        return connection; 
    }
}

