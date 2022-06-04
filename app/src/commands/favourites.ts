import Discord, { Message } from 'discord.js';
import { Command } from './command';
import { Favourite } from '../db/models/favourites';
import { PlayCommand } from './play';
export const FavouritesCommand : Command = {
    name: 'favourites',
    description: 'List of favourite songs.',
    aliases: ['f'],
    execute: favourites,
};

async function favourites(message: Discord.Message, args: string[]){
    const songName = args.slice(1).join(' ');
    if(args[0] == 'add'){
        if(args.length < 2){
            message.reply('Bad usage. Use !favourites add <song name>');
            return false;
        }
        const favouritesNumber = await Favourite.count({
            where: {
                user_id: message.author.id,
                is_active: true,
            }
        });
        console.log(favouritesNumber)
        if(favouritesNumber >= 10){
            message.reply('You can only add 10 songs to your favourites.');
            return false;
        }
        else {
            await Favourite.create({
                user_id: message.author.id,
                user_name: message.author.username,
                song_name: songName,
                is_active: true,
            }).then(() => {
                message.reply('Successfully added ' + songName + ' to favourites.');
            });
        }
        
    }
    else if(args[0] == 'remove'){
        if(args.length < 2){
            message.reply('Bad usage. Use !favourites remove <song name>');
            return false;
        }
        const favourites = await Favourite.findOne({
            where: {
                user_id: message.author.id,
                song_name: songName,
                is_active: true,
            }
        });
        if (!favourites) {
            message.reply('Could not find ' + songName + ' in favourites.');
            return false;
        }
        await Favourite.update({
            is_active: false,
        }, {
            where: {
                user_id: message.author.id,
                song_name: songName,
            }
        }).then(() => {message.reply('Successfully removed ' + songName + ' from favourites.');});
    }
    else if (args[0] == 'play'){
        const favourites = await Favourite.findAll({
            where: {
                user_id: message.author.id,
                is_active: true,
            }
        });

        if(favourites.length == 0){
            message.reply('You have no favourites songs to play.');
            return false;
        }

        for(let i = 0; i < favourites.length; i++){
            PlayCommand.execute(message, [favourites[i].song_name]);
        }
        return true;
    }
    else if(args.length == 0){
        const favourites = await Favourite.findAll({
            where: {
                user_id: message.author.id,
                is_active: true,
            }
        });
        if(favourites.length == 0){
            message.reply('You have no favourites songs.');
            return false;
        }
        let buffer = 'Your favourites songs: \n';
        for(let i = 0; i < favourites.length; i++){
            buffer += '' + (i+1) + '. ' + favourites[i].song_name + '\n';
        }
        message.reply(buffer);
        return true;
    }
    else{
        message.reply('Bad usage. Use !favourites add <song name> or !favourites remove <song name> or !favourites');
    }
    return true;
}
