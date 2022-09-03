import Discord from 'discord.js';

import { Command } from './command';
import { JoinCommand } from './join';
import { Subscription, getSubscription } from '../bot';
import { isInVoice } from '../tools';
import ytSearch from 'yt-search'
import SpotifyWebApi from 'spotify-web-api-node'
import 'dotenv/config'

const { SPOTIFY_ACCESS_TOKEN } = process.env

const spotify = new SpotifyWebApi({ accessToken: SPOTIFY_ACCESS_TOKEN });

type MusicSource = {
  kind: "video-url" | "query" | "yt-playlist" | "spotify-playlist" | "unknown",
  id?: string
}

export const PlayCommand: Command = {
  name: 'play',
  description: 'Search and plays given song',
  aliases: ['p', 'pl', 'start', 'search'],
  execute: addToQueue
};

async function addToQueue(message: Discord.Message, args: String[]): Promise<boolean> {
  const bot: Subscription = getSubscription(message);
  if (!isInVoice(message)) {
    message.reply("You need to be in a voice channel to do that.");
    return false;
  }
  if (bot.isInVoiceChannel() && !bot.isInVoiceChannel(message)) {
    message.reply("You need to be in a voice channel with bot to do that");
    return false;
  }
  if (args.length == 0 && !bot.currentSong) {
    message.reply("You need to specify a song to play.");
    return false;
  }
  else if (args.length == 0) {
    if (!bot.isInVoiceChannel()) {
      JoinCommand.execute(message);
    }
    bot.processQueue();
    return;
  }

  const query = args.join(' ');
  const source = getSourceFromQuery(query);
  let ytPlaylist = null;
  let video = null;

  switch (source.kind) {
    case 'query':
      let result = await ytSearch(query);
      if (result.videos.length > 0) {
        if (result.videos.length == 0) {
          message.reply("Couldn't find requested query :(");
        } else {
          let video = result.videos[0];
          if (bot.currentSong == null) {
            message.reply(`Playing ${video.title} (${video.timestamp})`)
          } else {
            message.reply(`Added ${video.title} to queue (pos: ${bot.queue.length + 1})`)
          }

          bot.enqueue(video);
        }
      }
      break;

    case 'video-url':
      video = await ytSearch({ videoId: source.id });
      if (video) {
        if (bot.currentSong == null) {
          message.reply(`Playing ${video.title} (${video.timestamp})`)
        } else {
          message.reply(`Added ${video.title} to queue (pos: ${bot.queue.length + 1})`)
        }
        bot.enqueue(video);
      } else {
        message.reply("Couldn't find requested query :(");
      }
      break;

    case 'yt-playlist':
      ytPlaylist = await ytSearch({ listId: source.id });
      if (ytPlaylist || ytPlaylist.videos.length == 0) {
        message.reply(`Added playlist '${ytPlaylist.title}' to queue (${ytPlaylist.videos.length} songs).`);
        ytPlaylist.videos.forEach(video => {
          ytSearch({ videoId: video.videoId }).then(vid => bot.enqueue(vid))
        })
      } else {
        message.reply("Requested playlist doesn't exists or is empty.")
      }
      break;

    case 'spotify-playlist':
      spotify.getPlaylist(source.id).then(playlist => {
        let tracks = playlist.body.tracks.items;
        message.reply(`Adding ${tracks.length} songs from playlist '${playlist.body.name}' to the queue...`)
        tracks.forEach(item => {
          let songName = `${item.track.artists[0].name} - ${item.track.name}`;
          ytSearch(songName).then(song => {
            if (song.videos.length > 0) {
              bot.enqueue(song.videos[0]);
            }
          })
        })
      }).catch(_ => {
        message.reply("Couldn't load request playlist");
      })
      break;
  }

  if (!bot.isInVoiceChannel()) {
    bot.debug('Bot is not in VC @ PlayCommand')
    await JoinCommand.execute(message);
  }
}

/**
 * Returns source of a music from given query
 */
function getSourceFromQuery(query: string): MusicSource {
  const YT_VIDEO_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  let videoMatch = query.match(YT_VIDEO_REGEX)
  if (videoMatch) {
    return {
      kind: "video-url",
      id: videoMatch[2]
    }
  }

  const YT_PLAYLIST_REGEX = /[?&]list=([^#\&\?]+)/
  let playlistMatch = query.match(YT_PLAYLIST_REGEX)
  if (playlistMatch) {
    console.log(playlistMatch)
    return {
      kind: "yt-playlist",
      id: playlistMatch[1]
    }
  }

  const SPOTIFY_PLAYLIST_REGEX = /\bhttps?:\/\/[^/]*\bspotify\.com\/playlist\/([^\s?]+)/;
  let spotifyMatch = query.match(SPOTIFY_PLAYLIST_REGEX)
  if (spotifyMatch) {
    console.log(spotifyMatch)
    return {
      kind: "spotify-playlist",
      id: spotifyMatch[1]
    }
  }

  return {
    kind: "query"
  }
}
