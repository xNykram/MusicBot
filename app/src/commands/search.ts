import ytSearch from 'yt-search';
import Discord, { MessageEmbed } from 'discord.js';

import { Command } from './command';
import { Subscription, getSubscription } from '../bot';
import { isInVoice } from '../tools';
import { JoinCommand } from './join';

export const MAX_SEARCH_RESULTS = 5

export const SearchCommand: Command = {
    name: 'search',
    description: 'Search for a given title',
    aliases: ['find', 'sear', 'yt', 'youtube'],
    execute: searchQuery
}

export const AGREE_EMOJI: string = '✅'
export const SEARCH_VOTE_TIME = 30_000

async function searchQuery(message: Discord.Message, args: string[]): Promise<boolean> {
    const bot: Subscription = getSubscription(message);
    const query = args.join(' ')

    if (!isInVoice(message)) {
        message.reply("You need to be in a voice channel to do that.");
        return false;
    }
    if (args.length == 0) {
        message.reply("Specify query. Use !search <query>")
        return false;
    }


    ytSearch(query).then(searchResult => {
        const videosFound = searchResult.videos.slice(0, MAX_SEARCH_RESULTS)
        if (videosFound.length == 0) {
            message.reply(`Couldn't find any videos for query '${query}'.`)
            return false
        }

        let collectedSongs: ytSearch.VideoSearchResult[] = []
        for (let index = 0; index < Math.min(videosFound.length, MAX_SEARCH_RESULTS); ++index) {
            const videoInfo = videosFound.at(index)
            const embed = new MessageEmbed()
                .setTitle(videoInfo.title)
                .setURL(videoInfo.url)
                .setThumbnail(videoInfo.image)
                .setAuthor({ name: videoInfo.author.name, url: videoInfo.author.url })
                .addField("Duration: ", videoInfo.timestamp)

            const filter = (reaction: Discord.MessageReaction, user: Discord.User) => reaction.emoji.name === AGREE_EMOJI && user.id != message.client.user.id
            message.reply({ embeds: [embed] }).then(msg => {
                msg.react(AGREE_EMOJI).then(() => {
                    let collector = msg.createReactionCollector({ filter, time: SEARCH_VOTE_TIME })
                    collector.on('end', (collected) => {
                        // search for any (non bot) emoji 
                        if (collected.find(emoji => emoji.count > 1) != null) {
                            collectedSongs.push(videoInfo)
                        }
                        msg.delete()
                    })
                })
            })
        }

        message.reply("React to song you'd like to add to queue").then(msg => {
            setTimeout(() => {
                msg.delete()
                let songStr = ''
                if (collectedSongs.length == 0) {
                    return
                }
                if (!bot.isInVoiceChannel()) {
                    JoinCommand.execute(message)
                }
                for (let song of collectedSongs) {
                    bot.enqueue(song)
                    songStr += `\n${song.title} (${song.timestamp})`
                }
                message.reply("Songs added to queue: " + songStr)

            }, SEARCH_VOTE_TIME)
        })

    })

    return true
}
