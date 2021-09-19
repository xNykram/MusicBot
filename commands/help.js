

module.exports = {
    name: 'help',
    description: 'Prints all available commands.',
    execute(message, commands, args){
        var helpMsg = '';
        for(const [_, command] of commands)
        {
            helpMsg += `- !${command.name} - ${command.description}\n`
        }
        message.reply(helpMsg);
    }

}
