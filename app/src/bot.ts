import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayer,
    AudioPlayerStatus,
    VoiceConnection,
    VoiceConnectionStatus,
    VoiceConnectionDisconnectReason,
    entersState,
    getVoiceConnection
} from '@discordjs/voice';

import { VideoSearchResult as VideoInfo } from 'yt-search';

import { promisify } from 'util';

import ytdl from 'ytdl-core';
import Discord from 'discord.js';

const wait = promisify(setTimeout);
const subscriptions = new Map();

export class Subscription {
    guildId: string;
    guildName: string;
    audioPlayer: AudioPlayer;
    queue: VideoInfo[];
    queueLock = false;
    readyLock = false;
    currentSong: VideoInfo;

    constructor(guild: Discord.Guild) {
        this.guildId = guild.id;
        this.guildName = guild.name;
        this.queue = [];
    }


    subscribe(voiceConnection: VoiceConnection) {
        this.audioPlayer = createAudioPlayer();

        voiceConnection.on('stateChange', (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    if (!this.waitForState(VoiceConnectionStatus.Connecting, 5000)) {
                        voiceConnection.destroy();
                    }
                }
                else if (voiceConnection.rejoinAttempts < 5) {
                    //in this case we can try to reconnect
                    this.waitForRejoin();
                }
                else {
                    //no more attempts :(
                    voiceConnection.destroy();
                }
            }
            else if (newState.status === VoiceConnectionStatus.Destroyed) {
                this.stop();
            }
            else if (!this.readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)) {
                this.readyLock = true;
                if (!this.waitForState(VoiceConnectionStatus.Ready, 20000)) {
                    if (voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
                        voiceConnection.destroy();
                }
                this.readyLock = false;
            }
        });

        this.audioPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                //audio resource has finished playing
                this.currentSong = null;
                this.processQueue();
            }
        });

        this.audioPlayer.on('error', (error) => {
            console.log('Error occured');
            console.log(error);
            this.currentSong = null;
            this.queueLock = false;
            this.processQueue();
        });

        voiceConnection.subscribe(this.audioPlayer);
    }

    /* Bot state functions */

    async waitForState(state: VoiceConnectionStatus, timeout: number) {
        let voiceConnection = this.getVoice();
        try {
            await entersState(voiceConnection, state, timeout);
            return true;
        }
        catch {
            return false;
        }
    }

    getVoice() : VoiceConnection { 
        return getVoiceConnection(this.guildId)
    }

    async waitForRejoin() {
        let voiceConnection = this.getVoice();
        await wait((voiceConnection.rejoinAttempts + 1) * 5000);
        voiceConnection.rejoin();
    }

    async stop() {
        this.queue = [];
        this.currentSong = null;
        this.audioPlayer.stop(true);
        let voiceConnection = this.getVoice();
        if (this.isInVoiceChannel(null))
            voiceConnection.disconnect()
    }

    async leave() {
        let voiceConnection = this.getVoice();
        if (this.isInVoiceChannel(null)) {
            voiceConnection.disconnect();
            return true;
        }

        return false;
    }

    async pause() {
        this.audioPlayer.pause(true)
    }

    status() {
        return this.audioPlayer.state.status
    }

    /* VC functions */

    /**
     * it returns true in two cases:
     * - message is present and bot is in the same voice channel as message sender
     * - message is not present and bot is connected to any voice channel
     * 
     */
    isInVoiceChannel(message?: Discord.Message): boolean {
        let voiceConnection = this.getVoice();
        if(voiceConnection?.state?.status != VoiceConnectionStatus.Ready) {
            this.debug(`Connection is not ready. Current status: ${voiceConnection?.state?.status}`);
            return false;
        }
        if(message) {
            let isVoice = message.member?.voice?.channel?.isVoice()
            let userChannelId = message.member?.voice?.channelId
            let botChannelId = voiceConnection.joinConfig.channelId
            this.debug(`isVoice:${isVoice}, userChannelId=${userChannelId}, botChannelId=${botChannelId}`)
            return isVoice && (userChannelId == botChannelId)
        }

        return true
    }

    disconnectFromVoiceChannel() {
        let voiceConnection = this.getVoice();
        if (voiceConnection == null)
            return false;

        voiceConnection.disconnect();
        return true;
    }

    connectToVoiceChannel(message: Discord.Message) {
        if (this.isInVoiceChannel(message)) {
            return null;
        }

        const channel = message.member?.voice?.channel;
        if(!channel) {
            this.debug(`Provided channel is not a voice channel. @ Bot.connectToVoiceChannel`)
            return null;
        }
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            //@ts-ignore
            adapterCreator: channel.guild.voiceAdapterCreator
        });


        this.subscribe(connection);

        return connection;
    }

    /* Queue processing functions */

    async enqueue(song: VideoInfo) {
        this.queue.push(song);
        this.processQueue();
    }

    /**
     *  @param song - Song to remove
     *  Removes last apperance of song in queue 
     *  or stops music if queue doesn't contain song
     *  and currently playing song is given song
     */
    async removeSong(song: VideoInfo): Promise<boolean> {
        const lastIndex = this.queue.lastIndexOf(song)

        if (lastIndex == -1) {
            if (this.currentSong == song) {
                this.currentSong = null
                this.audioPlayer.stop()
                return true
            }

            return false
        }

        this.queue.splice(lastIndex, 1)

        return true
    }

    async processQueue() {
        if (this.audioPlayer == null)
            this.audioPlayer = createAudioPlayer()
        if (this.queueLock || (this.audioPlayer.state.status !== AudioPlayerStatus.Idle)) {
            return;
        }

        if ((this.queue.length == 0) && !this.currentSong) {
            this.disconnectFromVoiceChannel();
            return;
        }

        this.queueLock = true;
        const nextTrack = this.currentSong ? this.currentSong : this.queue.shift();

        try {
            const stream = ytdl(nextTrack.url, {
                liveBuffer: 4000,
                filter: 'audioonly',
                highWaterMark: 1 << 25
            });
            const resource = createAudioResource(stream);
            this.currentSong = nextTrack;
            this.audioPlayer.stop(true);
            this.audioPlayer.play(resource);
            this.queueLock = false;
        }
        catch (error) {
            this.queueLock = false;
            this.currentSong = null;
            console.log(error);
            this.processQueue();
        }
    }

    /**
     * Prints debug info formatted with guild name and time.
     * This function have effect only if bot have been started with -d flag
     */
    debug(log: string) {
        if(process.argv.includes('-d')) {

            let dateStr: string = new Date().toLocaleString();
            console.log(`[${this.guildName}] - ${dateStr} >> ${log}`)
        }
    }
}

export function getSubscription(message: Discord.Message) {
    var sub = subscriptions.get(message.guild.id);
    if (sub)
        return sub;

    sub = new Subscription(message.guild);
    subscriptions.set(message.guild.id, sub);
    sub.debug(`Bot instance created.`)

    return sub;
}
