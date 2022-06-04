// Setup
import { prefix, token, testToken } from './config.json';
import { Command } from './commands/command';
import Discord, { Client, Intents } from 'discord.js';
import { logServer } from './tools';

import { HelpCommand } from './commands/help';
import { JoinCommand } from './commands/join';
import { LeaveCommand } from './commands/leave';
import { PlayCommand } from './commands/play';
import { StopCommand } from './commands/stop';
import { QueueCommand } from './commands/queue';
import { SkipCommand } from './commands/skip';
import { ShuffleCommand } from './commands/shuffle';
import { LoopCommand } from './commands/loop';
import { SearchCommand } from './commands/search';
import { getSubscription, Subscription } from './bot';
import { isInVoice, logMessage } from './tools';
import { ChangelogCommand } from './commands/changelog';
import { RemoveCommand } from './commands/remove';
import { StatusCommand } from './commands/status';
import { TopSongsCommand } from './commands/top';
import { FavouritesCommand } from './commands/favourites';

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
    LoopCommand,
    StatusCommand,
    TopSongsCommand,
    FavouritesCommand,
];

var commandMap = new Discord.Collection<String, Command>();

for (const command of commandsList) {
    commandMap.set(command.name, command);
    command.aliases.forEach(alias => commandMap.set(alias.toLowerCase(), command));
}

client.once('ready', () => {
    client.guilds.cache.forEach(guild => {
        logServer(guild.id ,guild.name, guild.memberCount);
    });
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
            command.execute(message, args.splice(1))
            .then(() => {
                logMessage(message.guild.name, message.guild.id, message.content, null, false, null)
            })
            .catch(reason => {
                logMessage(message.guild.name, message.guild.id ,message.content, reason.toString(), true, null)
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


