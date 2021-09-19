const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'leave',
    description: 'Forces bot to leave from voice channel',
    execute(message, args){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel)
        {
            return false;
        }
        return getVoiceConnection(message.guild.id).disconnect();
    }


}
