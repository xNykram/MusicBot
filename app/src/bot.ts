import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayer,
    AudioPlayerStatus,
    VoiceConnection,
    VoiceConnectionStatus,
    VoiceConnectionDisconnectReason,
    entersState } from '@discordjs/voice';

import { VideoSearchResult as VideoInfo } from 'yt-search';

import { isInVoice } from './tools.js';
import { promisify } from 'util';

import ytdl from 'ytdl-core';
import Discord from 'discord.js';

const wait = promisify(setTimeout);
const subscriptions = new Map();


export class Subscription {
    voiceConnection: VoiceConnection;
    audioPlayer: AudioPlayer;
    queue: VideoInfo[];
    queueLock = false;
    readyLock = false;
    currentSong: VideoInfo;

    constructor() {
        this.queue = [];
    }

    subscribe(voiceConnection: VoiceConnection) {
        this.voiceConnection = voiceConnection;
        this.audioPlayer = createAudioPlayer();

        this.voiceConnection.on('stateChange', (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    if (!this.waitForState(VoiceConnectionStatus.Connecting, 5000)) {
                        this.voiceConnection.destroy();
                    }
                }
                else if (this.voiceConnection.rejoinAttempts < 5) {
                    //in this case we can try to reconnect
                    this.waitForRejoin();
                }
                else {
                    //no more attempts :(
                    this.voiceConnection.destroy();
                    this.voiceConnection = null;
                }
            }
            else if (newState.status === VoiceConnectionStatus.Destroyed) {
                this.stop();
            }
            else if (!this.readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)) {
                this.readyLock = true;
                if (!this.waitForState(VoiceConnectionStatus.Ready, 20000)) {
                    if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
                        this.voiceConnection.destroy();
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

        this.voiceConnection.subscribe(this.audioPlayer);
    }

    /* Bot state functions */

    async waitForState(state: VoiceConnectionStatus, timeout: number) {
        try {
            await entersState(this.voiceConnection, state, timeout);
            return true;
        }
        catch {
            return false;
        }
    }

    async waitForRejoin() {
        await wait((this.voiceConnection.rejoinAttempts + 1) * 5000);
        this.voiceConnection.rejoin();
    }

    async stop() {
        this.queue = [];
        this.currentSong = null;
        this.audioPlayer.stop(true);
        if (this.isInVoiceChannel(null))
            this.voiceConnection.disconnect()
    }

    async leave() {
        if (this.isInVoiceChannel(null)) {
            this.voiceConnection.disconnect();
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

    isInVoiceChannel(message?: Discord.Message) {
        if (this.voiceConnection == null)
            return false;
        if (message) {
            if (!isInVoice(message))
                return false;
            const channelId = message.member.voice.channelId;

            return channelId === this.voiceConnection.joinConfig.channelId;
        }

        return this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed
    }

    getVoiceChannel() {
        if (this.voiceConnection == null)
            return null;

        return this.voiceConnection.joinConfig.channelId;
    }

    disconnectFromVoiceChannel() {
        if (this.voiceConnection == null)
            return false;

        this.voiceConnection.disconnect();
        return true;
    }

    connectToVoiceChannel(message: Discord.Message) {
        if (this.isInVoiceChannel(message)) {
            return null;
        }

        const channel = message.member.voice.channel;
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

    async processQueue() {
        if (this.queueLock || (this.audioPlayer.state.status !== AudioPlayerStatus.Idle)) {
            console.log(`lock: ${this.queueLock} state: ${this.audioPlayer.state.status}, len: ${this.queue.length}`);

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
}

export function getSubscription(message: Discord.Message) {
    var sub = subscriptions.get(message.guild.id);
    if (sub)
        return sub;

    sub = new Subscription();
    subscriptions.set(message.guild.id, sub);

    return sub;
}
