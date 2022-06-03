import { Client, Message } from 'discord.js'
import { Logs } from './db/models/logs';
import { Server } from './db/models/servers'
import prettyMilliseconds from 'pretty-ms';
import os from 'os'
import { sequelize } from './db/db';

export function isInVoice(message: Message) {
    return message.member?.voice?.channel != null
}

export async function logMessage(server: string, serverID: string, taskType: string, error: unknown, status: boolean) {
    try{
        await Logs.create({
            server_name: server,
            server_id: serverID,
            task: taskType,
            message: error,
            failed: status,
        })
    }
    catch(error) {
        console.log(error);
    }
}

export function getUptime(client: Client) {
    return prettyMilliseconds(client.uptime);
}

export function getFreeRAM(){
    return Math.round(os.freemem() / (1024 * 1024))
}

export async function checkDBConnection(){

    const AGREE_EMOJI: string = '✅'
    const DISAGREE_EMOJI: string = '❌'
    let status: string;
    
    await sequelize.authenticate()
    .then(() => {
        status = AGREE_EMOJI;
    })
    .catch(() => {
        status = DISAGREE_EMOJI;
    });

    return status;
}

export async function logServer(serverName: string, amountOfUsers: number) {
    try{
        await Server.findOrCreate({
            where: {server_name: serverName},
            defaults: {
                server_name: serverName,
                amount_of_users: amountOfUsers,
            }
        });
    }
    catch(error) {
        console.log(error);
    }
}