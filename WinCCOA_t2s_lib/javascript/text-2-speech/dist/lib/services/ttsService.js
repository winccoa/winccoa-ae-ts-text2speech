"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSService = void 0;
const say = require('say');
class TTSService {
    defaultVoice;
    defaultSpeed = 1.0;
    defaultVolume = 100; // Keep for future use
    maxQueueSize = 5;
    isSpeaking = false;
    queue = [];
    constructor(defaultVoice, defaultSpeed) {
        this.defaultVoice = defaultVoice;
        if (defaultSpeed)
            this.defaultSpeed = defaultSpeed;
    }
    async speak(text, voice, speed, volume) {
        return new Promise((resolve, reject) => {
            // Check queue size before adding
            if (this.queue.length >= this.maxQueueSize) {
                reject(new Error('TTS queue is full'));
                return;
            }
            const announcement = {
                text,
                voice,
                speed,
                volume,
                resolve,
                reject
            };
            this.queue.push(announcement);
            console.log(`Added to queue: "${text}" (Queue length: ${this.queue.length})`);
            // Start processing if not already speaking
            if (!this.isSpeaking) {
                this.processQueue();
            }
        });
    }
    processQueue() {
        if (this.queue.length === 0 || this.isSpeaking) {
            return;
        }
        const announcement = this.queue.shift();
        if (!announcement)
            return;
        this.isSpeaking = true;
        const voiceToUse = announcement.voice || this.defaultVoice;
        const speedToUse = announcement.speed || this.defaultSpeed;
        const volumeToUse = announcement.volume || this.defaultVolume;
        console.log(`Speaking: "${announcement.text}" with voice: ${voiceToUse}, speed: ${speedToUse}, volume: ${volumeToUse} (volume not supported by say library)`);
        // Note: say library doesn't support volume, so we only use voice and speed
        say.speak(announcement.text, voiceToUse, speedToUse, (err) => {
            this.isSpeaking = false;
            if (err) {
                console.error('TTS Error:', err);
                announcement.reject(new Error(err));
            }
            else {
                console.log('Speech completed successfully');
                announcement.resolve();
            }
            setTimeout(() => this.processQueue(), 100);
        });
    }
    async stop() {
        return new Promise((resolve) => {
            // Clear the queue
            this.queue.forEach(announcement => {
                announcement.reject(new Error('Speech stopped'));
            });
            this.queue = [];
            if (this.isSpeaking) {
                say.stop();
                this.isSpeaking = false;
            }
            resolve();
        });
    }
    async getAvailableVoices() {
        return new Promise((resolve) => {
            say.getInstalledVoices((err, voices) => {
                if (err) {
                    console.error("Error getting installed voices:", err);
                    resolve([]);
                }
                else {
                    resolve(voices || []);
                }
            });
        });
    }
    setDefaultVoice(voice) {
        this.defaultVoice = voice;
    }
    setDefaultSpeed(speed) {
        this.defaultSpeed = speed;
    }
    setDefaultVolume(volume) {
        this.defaultVolume = volume;
        console.log(`Volume set to ${volume}% (note: not supported by say library)`);
    }
    setMaxQueueSize(size) {
        this.maxQueueSize = size;
    }
    isSpeechActive() {
        return this.isSpeaking;
    }
    getQueueLength() {
        return this.queue.length;
    }
    clearQueue() {
        this.queue.forEach(announcement => {
            announcement.reject(new Error('Queue cleared'));
        });
        this.queue = [];
    }
}
exports.TTSService = TTSService;
