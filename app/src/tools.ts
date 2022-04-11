import { Message } from 'discord.js'
import { Logs } from './db/models/logs';

export function isInVoice(message: Message) {
    return message.member?.voice?.channel != null
}

export async function logMessage(server: string, serverID: string, taskType: string, error: unknown, status: boolean) {
    try{
        const log = await Logs.create({
            server_name: server,
            server_id: serverID,
            task: taskType,
            message: error,
            failed: status,
        })
    }
    catch(error) {
        console.log(error)
    }
}