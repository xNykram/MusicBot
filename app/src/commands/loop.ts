import { Message } from 'discord.js'
import { Command } from './command'

export const LoopCommand: Command = {
    name: '',
    description: '',
    aliases: [],
    execute: loopQueue
}

function loopQueue(message: Message, args: string[]) {
    //TODO implement loop command
}

