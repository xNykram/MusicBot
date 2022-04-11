// Setup
import { prefix, token, testToken } from './config.json';
import { Command } from './commands/command';
import Discord, { Client, Intents } from 'discord.js';

import { HelpCommand } from './commands/help';
import { JoinCommand } from './commands/join';
import { LeaveCommand } from './commands/leave';
import { PlayCommand } from './commands/play';
import { StopCommand } from './commands/stop';
import { QueueCommand } from './commands/queue';
import { SkipCommand } from './commands/skip';
import { ShuffleCommand } from './commands/shuffle';
import { SearchCommand } from './commands/search';
import { getSubscription, Subscription } from './bot';
import { isInVoice } from './tools';
import { ChangelogCommand } from './commands/changelog';
import { RemoveCommand } from './commands/remove';

var debug = false;

if (process.argv.includes('-d')) {
    debug = true;
}

const intents = new Intents(32509)
intents.add(Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
const client = new Client({ intents });

const commandsList: Command[] = [
    HelpCommand,
    JoinCommand,
    LeaveCommand,
    PlayCommand,
    StopCommand,
    SkipCommand,
    QueueCommand,
    ShuffleCommand,
    SearchCommand,
    ChangelogCommand,
    RemoveCommand,
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
        const bot: Subscription = getSubscription(message)
        let userInVoice = isInVoice(message)
        let botInVoiceWithUser = bot.isInVoiceChannel(message)
        if(command.requireVoiceChannel && (!userInVoice || !botInVoiceWithUser)) {
            message.reply("You have to be in voice channel with bot to do that!")
            bot.debug(`User not in VC with bot. userInVoice: ${userInVoice}, botInVoiceWithUser: ${botInVoiceWithUser}`)
            return
        }

        if (command.name == 'help') {
            command.execute(message, commandsList);
        }
        else {
            command.execute(message, args.splice(1)).catch(reason => {
                bot.debug(`Cought error: ${reason}`)
            });
        }
    }
    else {
        message.reply(`There is no command ${commandName}. Type !help to see command list`);
    }
})

if (debug) {
    client.login(testToken);
}
else {
    client.login(token);
}


