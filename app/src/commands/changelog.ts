import Discord, { Message, MessagePayload } from 'discord.js'

import { Command } from './command';
import { Subscription, getSubscription } from '../bot';
import { Changelog } from '../db/models/changelog';

export const ChangelogCommand : Command = {
    name: 'changelog',
    description: 'Display a list of the latest changes.',
    aliases: ['chlog'],
    execute: displayChangelog
};

function displayChangelog(message: Discord.Message) {
    let changelog: string;
    const bot: Subscription = getSubscription(message);
    return getChangelogs(message)
}

async function getChangelogs (message: Discord.Message) {
    try {
        const rows = await Changelog.findAll({
            attributes: ['author', 'title', 'description', 'createdAt'],
            limit: 5,
        });
        let obj = JSON.stringify(rows, null, 2)
        let json = JSON.parse(obj)
        let buffer: string = '';
        for (let i = 0; i < Object.keys(json).length; i++){
            buffer += "```"+json[i]['createdAt']+" \n"+ "Title: " +json[i]['title'] + "\nAuthor: "+ json[i]['author'] +"\n"
            +"Description: "+ json[i]['description'] +"```";
        }
        return message.reply(buffer);
    }
    catch (error) {
        return message.reply('Something went wrong, please try again later.');
    }
}