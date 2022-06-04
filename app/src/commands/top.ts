import Discord, { Message } from 'discord.js';
import { Command } from './command';
import { getUptime, getFreeRAM, checkDBConnection } from '../tools';
import { sequelize } from '../db/db';
const { QueryTypes } = require('sequelize');

export const TopSongsCommand : Command = {
    name: 'top',
    description: 'Shows best songs',
    aliases: ['t'],
    execute: printTopSongs,
};

async function printTopSongs(message: Discord.Message, args: string[]){

    let buffer = ''

    if (args.length > 0 && args[0] != 'global'){

        message.reply('Bad usage. Use !top or !top global');
        return false;

    }
    
    if (args.length == 0) {
        const topGuild = await sequelize.query('SELECT * FROM vwTopStats WHERE server_id = ' + message.guild.id + ' ORDER BY Amount DESC', {
            type: QueryTypes.SELECT,
            raw: true,
        });
        buffer += 'Songs ranking for server: '+ message.guild.name +' (TOP 3): \n'
        for (let i = 0; i < 3; i++){
            buffer += ''+ (i+1) +'.' + ' ' + topGuild[i].Song + ' [Played '+ topGuild[i].Amount + ' times]'+'\n'
        }
    }

    else {

        const topGlobal = await sequelize.query('SELECT * FROM vwTopStats ORDER BY Amount DESC', {
            type: QueryTypes.SELECT,
            raw: true,
        });
            buffer += 'Global songs ranking (TOP 3): \n'
        for (let i = 0; i < 3; i++){
            buffer += ''+ (i+1) +'.' + ' ' + topGlobal[i].Song + ' [Played '+ topGlobal[i].Amount + ' times]'+'\n'
        }

    }

    message.reply(buffer);

    return true;
}
