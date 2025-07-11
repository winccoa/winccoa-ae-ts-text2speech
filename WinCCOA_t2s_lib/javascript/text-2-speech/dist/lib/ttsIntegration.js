"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinCCOATTSIntegration = void 0;
const ttsService_1 = require("./services/ttsService");
class WinCCOATTSIntegration {
    tts;
    config;
    availableVoices = [];
    isInitialized = false;
    constructor() {
        // Default configuration
        this.config = {
            enabled: true,
            voice: '',
            speed: 1.0,
            volume: 100,
            maxQueueSize: 5,
            announceTypes: {
                alarms: true,
                status: true,
                init: true
            },
            severityFilter: {
                critical: true,
                warning: true,
                info: false
            },
            language: 'en-US'
        };
        this.tts = new ttsService_1.TTSService();
        this.initialize();
    }
    async initialize() {
        try {
            // Get available voices for configuration
            this.availableVoices = await this.tts.getAvailableVoices();
            console.log('Available voices:', this.availableVoices);
            // Set default voice if none specified
            if (!this.config.voice && this.availableVoices.length > 0) {
                this.config.voice = this.availableVoices[0];
                this.tts.setDefaultVoice(this.config.voice);
                console.log('Set default voice to:', this.config.voice);
            }
            // Apply initial configuration
            this.applyConfiguration();
            this.isInitialized = true;
            console.log('TTS Integration initialized with defaults.');
        }
        catch (error) {
            console.error('Error initializing TTS Integration:', error);
        }
    }
    // Method to update configuration from WinCC OA
    updateConfiguration(configJson) {
        try {
            const newConfig = JSON.parse(configJson);
            // Validate configuration
            if (this.validateConfig(newConfig)) {
                this.config = { ...this.config, ...newConfig };
                this.applyConfiguration();
                console.log('TTS Configuration updated:', this.config);
            }
            else {
                console.error('Invalid TTS configuration received');
            }
        }
        catch (error) {
            console.error('Error parsing TTS configuration:', error);
        }
    }
    validateConfig(config) {
        // Validate speed range
        if (config.speed !== undefined && (config.speed < 0.1 || config.speed > 3.0)) {
            return false;
        }
        // Validate volume range
        if (config.volume !== undefined && (config.volume < 0 || config.volume > 100)) {
            return false;
        }
        // Validate voice exists
        if (config.voice && !this.availableVoices.includes(config.voice)) {
            return false;
        }
        return true;
    }
    applyConfiguration() {
        // Apply settings to TTS service
        if (this.config.voice) {
            this.tts.setDefaultVoice(this.config.voice);
        }
        if (this.config.speed) {
            this.tts.setDefaultSpeed(this.config.speed);
        }
        // Clear queue if max size changed
        if (this.tts.getQueueLength() > this.config.maxQueueSize) {
            this.tts.clearQueue();
        }
    }
    // Get current configuration for WinCC OA UI (includes runtime info)
    getCurrentConfiguration() {
        return JSON.stringify({
            ...this.config,
            availableVoices: this.availableVoices,
            currentQueueLength: this.tts.getQueueLength(),
            isSpeaking: this.tts.isSpeechActive(),
            isInitialized: this.isInitialized
        });
    }
    // Check if the integration is fully initialized
    isReady() {
        return this.isInitialized;
    }
    // Method to be called from WinCC OA when an alarm occurs
    async announceAlarm(alarm) {
        if (!this.config.enabled || !this.config.announceTypes.alarms) {
            return;
        }
        // Check severity filter
        const shouldAnnounce = ((alarm.severity === 1 && this.config.severityFilter.critical) ||
            (alarm.severity === 2 && this.config.severityFilter.warning) ||
            (alarm.severity >= 3 && this.config.severityFilter.info));
        if (!shouldAnnounce) {
            return;
        }
        // Check queue size
        if (this.tts.getQueueLength() >= this.config.maxQueueSize) {
            console.log('TTS queue full, skipping announcement');
            return;
        }
        // Format the message based on severity
        let prefix = '';
        switch (alarm.severity) {
            case 1:
                prefix = "Critical alert: ";
                break;
            case 2:
                prefix = "Warning: ";
                break;
            default: prefix = "Information: ";
        }
        // Use urgent speak for critical alarms
        if (alarm.severity === 1 && 'speakUrgent' in this.tts) {
            await this.tts.speakUrgent(prefix + alarm.message);
        }
        else {
            await this.tts.speak(prefix + alarm.message);
        }
    }
    // Announce system status
    async announceStatus(status) {
        if (!this.config.enabled || !this.config.announceTypes.status) {
            return;
        }
        if (this.tts.getQueueLength() >= this.config.maxQueueSize) {
            console.log('TTS queue full, skipping status announcement');
            return;
        }
        await this.tts.speak(`System status update: ${status}`);
    }
    // Announce Init State
    async announceInit(message) {
        if (!this.config.enabled || !this.config.announceTypes.init) {
            return;
        }
        await this.tts.speak(`System initial state: ${message}`);
    }
    // Stop any current announcement
    async stopAnnouncement() {
        await this.tts.stop();
    }
    // Clear the announcement queue
    clearQueue() {
        this.tts.clearQueue();
    }
    // Get TTS status for monitoring
    getStatus() {
        return {
            enabled: this.config.enabled,
            speaking: this.tts.isSpeechActive(),
            queueLength: this.tts.getQueueLength()
        };
    }
}
exports.WinCCOATTSIntegration = WinCCOATTSIntegration;
