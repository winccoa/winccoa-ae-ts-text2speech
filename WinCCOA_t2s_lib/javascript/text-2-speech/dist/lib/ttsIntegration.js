"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinCCOATTSIntegration = void 0;
const ttsService_1 = require("./services/ttsService");
class WinCCOATTSIntegration {
    tts;
    constructor() {
        this.tts = new ttsService_1.TTSService();
        this.initialize();
    }
    async initialize() {
        // Get available voices for configuration
        const voices = await this.tts.getAvailableVoices();
        console.log('Available voices:', voices);
    }
    // Method to be called from WinCC OA when an alarm occurs
    async announceAlarm(alarm) {
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
        // Speak the alarm
        await this.tts.speak(prefix + alarm.message);
    }
    // Announce system status
    async announceStatus(status) {
        await this.tts.speak(`System status update: ${status}`);
    }
    // Announce Init State
    async announceInit(message) {
        await this.tts.speak(`System initial state: ${message}`);
    }
    // Stop any current announcement
    async stopAnnouncement() {
        await this.tts.stop();
    }
}
exports.WinCCOATTSIntegration = WinCCOATTSIntegration;
