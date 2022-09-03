import Discord from 'discord.js';
import { Command } from './command';

export const HelpCommand: Command = {
  name: 'help',
  description: 'Shows command list.',
  aliases: ['h', '?', '??'],
  execute: printHelp
};

async function printHelp(message: Discord.Message, commands: Command[]): Promise<boolean> {
  let helpMsg = 'Available commands:\n';

  for (const command of commands) {
    helpMsg += `!${command.name} - ${command.description}\n`;
  }

  message.reply(helpMsg);

  return true;
}
