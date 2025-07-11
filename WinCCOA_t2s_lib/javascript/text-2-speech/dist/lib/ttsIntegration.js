"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinCCOATTSIntegration = void 0;
const ttsService_1 = require("./services/ttsService");
class WinCCOATTSIntegration {
    tts;
    config;
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
            language: 'en-US',
            availableVoices: [],
            isInitialized: false
        };
        this.tts = new ttsService_1.TTSService();
        this.initialize();
    }
    async initialize() {
        try {
            // Get available voices for configuration
            this.config.availableVoices = await this.tts.getAvailableVoices();
            console.log('Available voices:', this.config.availableVoices);
            // Set default voice if none specified
            if (!this.config.voice && this.config.availableVoices.length > 0) {
                this.config.voice = this.config.availableVoices[0];
                this.tts.setDefaultVoice(this.config.voice);
                console.log('Set default voice to:', this.config.voice);
            }
            // Apply initial configuration
            this.applyConfiguration();
            this.config.isInitialized = true;
            console.log('TTS Integration initialized with defaults.');
        }
        catch (error) {
            console.error('Error initializing TTS Integration:', error);
            // Still mark as initialized even if voice discovery fails
            this.config.isInitialized = true;
        }
    }
    // Method to update configuration from WinCC OA
    updateConfiguration(configJson) {
        try {
            const newConfig = JSON.parse(configJson);
            // Don't allow overriding of availableVoices and isInitialized from external config
            delete newConfig.availableVoices;
            delete newConfig.isInitialized;
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
    applyConfiguration() {
        // Apply settings to TTS service
        if (this.config.voice) {
            this.tts.setDefaultVoice(this.config.voice);
        }
        if (this.config.speed) {
            this.tts.setDefaultSpeed(this.config.speed);
        }
        // Apply volume setting
        if (this.config.volume !== undefined) {
            this.tts.setDefaultVolume(this.config.volume);
        }
        // Apply max queue size
        if (this.config.maxQueueSize !== undefined) {
            this.tts.setMaxQueueSize(this.config.maxQueueSize);
        }
        // Clear queue if max size changed and current queue exceeds new limit
        if (this.tts.getQueueLength() > this.config.maxQueueSize) {
            this.tts.clearQueue();
        }
        // Language could be used for voice selection filtering
        if (this.config.language) {
            this.applyLanguageFilter();
        }
    }
    applyLanguageFilter() {
        // Filter available voices based on language preference
        // This is a simple implementation - could be enhanced
        const filteredVoices = this.config.availableVoices.filter(voice => {
            if (this.config.language.startsWith('en')) {
                return voice.toLowerCase().includes('english') ||
                    voice.toLowerCase().includes('zira') ||
                    voice.toLowerCase().includes('david');
            }
            // Add more language filters as needed
            return true;
        });
        // If no voice matches language, keep all voices available
        if (filteredVoices.length === 0) {
            console.log('No voices found for language:', this.config.language);
        }
        else {
            console.log(`Filtered voices for ${this.config.language}:`, filteredVoices);
        }
    }
    validateConfig(config) {
        // Validate speed range
        if (config.speed !== undefined && (config.speed < 0.1 || config.speed > 3.0)) {
            console.error('Invalid speed range:', config.speed);
            return false;
        }
        // Validate volume range
        if (config.volume !== undefined && (config.volume < 0 || config.volume > 100)) {
            console.error('Invalid volume range:', config.volume);
            return false;
        }
        // Validate max queue size
        if (config.maxQueueSize !== undefined && (config.maxQueueSize < 1 || config.maxQueueSize > 50)) {
            console.error('Invalid max queue size:', config.maxQueueSize);
            return false;
        }
        // Validate voice exists
        if (config.voice && !this.config.availableVoices.includes(config.voice)) {
            console.error('Voice not available:', config.voice);
            return false;
        }
        return true;
    }
    // Get current configuration for WinCC OA UI
    getCurrentConfiguration() {
        return JSON.stringify(this.config);
    }
    // Separate method for runtime status if needed for debugging/monitoring
    getRuntimeStatus() {
        return {
            queueLength: this.tts.getQueueLength(),
            speaking: this.tts.isSpeechActive()
        };
    }
    // Check if the integration is fully initialized
    isReady() {
        return this.config.isInitialized;
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
        try {
            // Use urgent speak for critical alarms
            if (alarm.severity === 1 && 'speakUrgent' in this.tts) {
                await this.tts.speakUrgent(prefix + alarm.message);
            }
            else {
                await this.tts.speak(prefix + alarm.message, this.config.voice, this.config.speed, this.config.volume);
            }
        }
        catch (error) {
            console.error('Failed to announce alarm:', error);
        }
    }
    // Announce system status
    async announceStatus(status) {
        if (!this.config.enabled || !this.config.announceTypes.status) {
            return;
        }
        try {
            await this.tts.speak(`System status update: ${status}`, this.config.voice, this.config.speed, this.config.volume);
        }
        catch (error) {
            console.error('Failed to announce status:', error);
        }
    }
    // Announce Init State
    async announceInit(message) {
        if (!this.config.enabled || !this.config.announceTypes.init) {
            return;
        }
        try {
            await this.tts.speak(`System initial state: ${message}`, this.config.voice, this.config.speed, this.config.volume);
        }
        catch (error) {
            console.error('Failed to announce init message:', error);
        }
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
