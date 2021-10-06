const {
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    VoiceConnectionDisconnectReason,
    entersState} = require('@discordjs/voice');

const { promisify } = require('util')
const ytdl = require('ytdl-core');
const join = require('./commands/join.js');
const wait = promisify(setTimeout);
const subscriptions = new Map();


class Subscription {
    voiceConnection;
    audioPlayer;
    queue;
    queueLock = false;
    readyLock = false;
    currentSong = null;

    constructor(voiceConnection) {
        this.voiceConnection = voiceConnection;
        this.audioPlayer = createAudioPlayer();
        this.queue = [];

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
                }
            }
            else if (newState.status === VoiceConnectionStatus.Destroyed) {
                this.stop();
            }
            else if (!this.readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)) {
                this.readyLock = true;
                if (!this.waitForState(VoiceConnectionStatus.Ready, 20000)) {
                    if (this.voiceConnection.status !== VoiceConnectionStatus.Destroyed)
                        this.voiceConnection.destroy();
                }
                this.readyLock = false;
            }
        });

        this.audioPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                //audio resource has finished playing
                this.processQueue();
            }
        });

        this.audioPlayer.on('error', (error) => {
            console.log('Error occured');
            console.log(error);
            this.resume();
        });

        this.voiceConnection.subscribe(this.audioPlayer);
    }

    async waitForState(state, timeout) {
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
        return this.audioPlayer.stop(true);
    }

    async pause(){
        return this.audioPlayer.pause(true)
    }

    async resume(){
        return this.audioPlayer.resume() 
    }

    status(){
        return this.audioPlayer.state.status
    }

    async enqueue(song) {
        this.queue.push(song);
        this.processQueue();
    }

    async processQueue() {
        if (this.queueLock || (this.audioPlayer.state.status !== AudioPlayerStatus.Idle) || (this.queue.length == 0)) {
            this.currentSong = null;
            console.log(`lock: ${this.queueLock} state: ${this.audioPlayer.state.status}, len: ${this.queue.length}`);
            return;
        }

        this.queueLock = true;
        const nextTrack = this.queue.shift();

        try {
            const stream = ytdl(nextTrack.url);
            const resource = createAudioResource(stream);
            this.currentSong = nextTrack;
            this.audioPlayer.play(resource);
            this.queueLock = false;
        }
        catch (error) {
            this.queueLock = false;
            this.currentSong = null;
            console.log(error);
            return this.processQueue();
        }
    }
}

function getSubscription(message, joinIfNotPresent) {
    var sub = subscriptions.get(message.guild.id);
    if (sub)
        return sub;

    if (joinIfNotPresent) {
        const connection = join.execute(message);
        if (connection) {
            sub = new Subscription(connection);
            subscriptions.set(message.guild.id, sub);
            return sub;
        }
    }

    return null;
}

module.exports = {
    Subscription: Subscription,
    getSubscription: getSubscription
};
