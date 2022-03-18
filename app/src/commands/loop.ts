import { Message } from 'discord.js'
import { Command } from './command'

export const LoopCommand: Command = {
    name: '',
    description: '',
    aliases: [],
    execute: loopQueue
}

async function loopQueue(message: Message, args: string[]): Promise<void> {
    //TODO implement loop command
}

