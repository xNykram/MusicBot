// Setup
const { prefix, token } = require('./config.json');

const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client({ intents: 32509 });

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Bot started.');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.split(' ');
    const commandName = args[0].substring(1);
    if (commandName === 'help') {
        client.commands.get('help').execute(message, client.commands, args);
    }
    else if (client.commands.has(commandName)) {
        client.commands.get(commandName).execute(message, args.slice(1));
    }
    else {
        message.reply(`Unknown command ${commandName}. Type !help to see command list.`);
    }
})

client.login(token);

