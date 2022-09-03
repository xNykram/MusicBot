import Discord from 'discord.js';

export interface Command {
  name: String,
  description: String,
  aliases: String[],
  execute: (message: Discord.Message, args?: any[]) => Promise<any>
  requireVoiceChannel?: boolean
};

