import Discord from 'discord.js';
import { Command } from './command';
import { getUptime, getFreeRAM, checkDBConnection } from '../tools';

export const StatusCommand : Command = {
    name: 'status',
    description: 'Shows helpful information',
    aliases: [],
    execute: printStatus
};

async function printStatus(message: Discord.Message, commands: Command[]): Promise<boolean> {
    let connection = await checkDBConnection();
    let buffer = "Connection information:\n";
    buffer += `Uptime: ${getUptime(message.client)}\n`;
    buffer += `Latency: ${Math.round(message.client.ws.ping)}ms\n`
    buffer += `Available memory: ${getFreeRAM()}MB\n`;
    buffer += `Database connection: ${connection}\n`;
    message.reply(buffer);

    return true;
}
