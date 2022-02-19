import { Message } from 'discord.js'

export function isInVoice(message: Message) {
    return message.member?.voice?.channel != null
}

