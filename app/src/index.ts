// Setup
import { prefix, token, testToken } from './config.json';
import { Command } from './commands/command';
import Discord from 'discord.js';

import { HelpCommand } from './commands/help';
import { JoinCommand } from './commands/join';
import { LeaveCommand } from './commands/leave';
import { PlayCommand } from './commands/play';
import { StopCommand } from './commands/stop';
import { QueueCommand } from './commands/queue';
import { SkipCommand } from './commands/skip';


const client = new Discord.Client({ intents: 32509 });

const commandsList: Command[] = [
    HelpCommand,
    JoinCommand,
    LeaveCommand,
    PlayCommand,
    StopCommand,
    SkipCommand,
    QueueCommand
];

var commandMap = new Discord.Collection<String, Command>();

for (const command of commandsList) {
    commandMap.set(command.name, command);
    command.aliases.forEach(alias => commandMap.set(alias.toLowerCase(), command));
}


client.once('ready', () => {
    if (debug)
        console.log("Bot started in debug mode.");
    else
        console.log('Bot started.');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.split(' ');
    const commandName = args[0].substring(1).toLowerCase();
    const command = commandMap.get(commandName);
    if (command) {
        if(command.name == 'help'){
            command.execute(message, commandsList);
        }
        else{
            command.execute(message, args.splice(1));
        }
    }
    else {
        message.reply(`There is no command ${commandName}. Type !help to see command list`);
    }
})

var debug = false;

if (process.argv.includes('-d')) {
    console.log(process.argv);
    console.log(`Token: ${testToken}`);
    client.login(testToken);
    debug = true;
}
else {
    client.login(token);
}


