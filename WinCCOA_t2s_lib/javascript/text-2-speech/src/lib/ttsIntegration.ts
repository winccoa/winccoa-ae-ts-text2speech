import { TTSService } from './services/ttsService';

interface Alarm {
  id: number;
  message: string;
  severity: number;
  timestamp: Date;
}

export class WinCCOATTSIntegration {
  private tts: TTSService;
  
  constructor() {
    this.tts = new TTSService();
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
    // Get available voices for configuration
    const voices = await this.tts.getAvailableVoices();
    console.log('Available voices:', voices);
  }
  
  // Method to be called from WinCC OA when an alarm occurs
  async announceAlarm(alarm: Alarm): Promise<void> {
    // Format the message based on severity
    let prefix = '';
    switch (alarm.severity) {
      case 1: prefix = "Critical alert: "; break;
      case 2: prefix = "Warning: "; break;
      default: prefix = "Information: ";
    }
    
    // Speak the alarm
    await this.tts.speak(prefix + alarm.message);
  }
  
  // Announce system status
  async announceStatus(status: string): Promise<void> {
    await this.tts.speak(`System status update: ${status}`);
  }

  // Announce Init State
  async announceInit(message: string): Promise<void> {
    await this.tts.speak(`System initial state: ${message}`);
  }
  
  // Stop any current announcement
  async stopAnnouncement(): Promise<void> {
    await this.tts.stop();
  }
}