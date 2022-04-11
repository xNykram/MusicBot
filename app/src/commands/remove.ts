import { Command } from './command';
import { Message } from 'discord.js';
import { getSubscription, Subscription } from '../bot';

export const RemoveCommand : Command = {
    name: 'remove',
    description: 'Removes given position(s) from the queue.',
    aliases: ['r', 'rm', 'del', 'delete'],
    execute: remove,
    requireVoiceChannel: true
}

type Range = { start: number, end: number };

async function remove(message: Message, args: string[]) {
    const bot: Subscription = getSubscription(message);
    if(args.length === 0) {
        printUsage(message);
        return;
    }

    const ranges = parseRanges(args);
    if(ranges.length === 0) {
        printUsage(message);
        return;
    }

    const queue = bot.queue;
    const newQueue = queue.filter((_, i) => {
        for(const entry of ranges) {
            if(typeof entry === 'number') {
                if(i === (entry as Number)) {
                    return false;
                }
            } else {
                let range = entry as Range;
                if(i >= range.start - 1 && i <= range.end) {
                    return false;
                }
            }
        }
        return true;
    });

    bot.queue = newQueue;
    const removedSongsCount = queue.length - newQueue.length;
    message.reply(`Removed ${removedSongsCount} song(s) from the queue.`);

}

//Function that takes a string array of ranges or numbers and returns an array of numbers or ranges
function parseRanges(args: string[]): (Number | Range)[] {
    try {
        return args.map(arg => {
            if(arg.includes('-')) {
                const range = arg.split('-');
                return { start: parseInt(range[0]), end: parseInt(range[1]) };
            } else {
                return parseInt(arg);
            }
        });
    } catch(e) {
        return [];
    }
}

function printUsage(message: Message) {
    message.reply('Usage: `!remove <range1> [range2] ...`');
}
