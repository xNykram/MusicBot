import { Message } from 'discord.js'

export function isInVoice(message: Message){
    return message != null
        && message.guild != null
        && message.member != null
        && message.member.voice != null
        && message.member.voice.channel != null;
}

