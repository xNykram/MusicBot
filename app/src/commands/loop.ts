import { Message } from 'discord.js'
import { Command } from './command'
import { Subscription, getSubscription } from '../bot';

export const LoopCommand: Command = {
  name: 'loop',
  description: 'Loops current queue given amount of times',
  aliases: [],
  execute: loopQueue
}
async function loopQueue(message: Message, args: string[]) {
  const bot: Subscription = getSubscription(message);
  let parseArgs: number

  let loopCounter: string[] | number
  let loopedSongs = []
  if (args.length == 0) {
    loopCounter = 1;
    parseArgs = 1;
  }
  else {
    parseArgs = parseInt(args[0])
  }
  if (isNaN(parseArgs)) {
    message.reply('Bad usage. Use !loop [number]');
    return false;
  }
  if (args.length > 1) {
    message.reply('Bad usage. Use !loop [number]');
    return false;
  }

  if (parseArgs <= 0) {
    message.reply('Bad usage. Use !loop [positive number]');
    return false;
  }

  if (args.length != 0) {
    loopCounter = args;
  }

  if (bot.queue.length == 0 && bot.currentSong == null) {
    message.reply("There are currently no songs in the queue to loop.");
    return false;
  }

  if (bot.currentSong != null) {
    for (let i = 0; i < loopCounter; i++) {
      loopedSongs.push(bot.currentSong);
      for (let j = 0; j < bot.queue.length; j++) {
        loopedSongs.push(bot.queue[j]);
      }
    }
  }

  if (loopedSongs.length + bot.queue.length >= 1000) {
    message.reply("Queue length should not exceed 1000 songs.");
    return false;
  }

  for (let i = 0; i < loopedSongs.length; i++) {
    bot.queue.push(loopedSongs[i]);
  }
  message.reply("Looped " + loopCounter + " times.");
  return true;
}
