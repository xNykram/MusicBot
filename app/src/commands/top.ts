import Discord, { Message } from 'discord.js';
import { Command } from './command';
import { sequelize } from '../db/db';
const { QueryTypes } = require('sequelize');

export const TopSongsCommand: Command = {
  name: 'top',
  description: 'Shows best songs',
  aliases: ['t'],
  execute: printTopSongs,
};

async function printTopSongs(message: Discord.Message, args: string[]) {

  let buffer = ''

  if (args.length > 0 && args[0] != 'global') {

    message.reply('Bad usage. Use !top or !top global');
    return false;

  }

  if (args.length == 0) {
    const topGuild = await sequelize.query('SELECT * FROM "topStats" WHERE server_id = ' + message.guild.id + ' ORDER BY amount DESC limit 3', {
      type: QueryTypes.SELECT,
      raw: true,
    });
    buffer += 'Songs ranking for server: ' + message.guild.name + ' (TOP 3): \n'
    for (let i = 0; i < topGuild.length; i++) {
      buffer += '' + (i + 1) + '.' + ' ' + topGuild[i].song + ' [Played ' + topGuild[i].amount + ' times]' + '\n'
    }
  }

  else {

    const topGlobal = await sequelize.query('SELECT * FROM "topStats" ORDER BY Amount DESC limit 3', {
      type: QueryTypes.SELECT,
      raw: true,
    });
    buffer += 'Global songs ranking (TOP 3): \n'
    for (let i = 0; i < topGlobal.length; i++) {
      buffer += '' + (i + 1) + '.' + ' ' + topGlobal[i].song + ' [Played ' + topGlobal[i].amount + ' times]' + '\n'
    }

  }

  message.reply(buffer);

  return true;
}
