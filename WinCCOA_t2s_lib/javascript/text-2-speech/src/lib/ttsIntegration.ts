import { TTSService } from './services/ttsService';

interface Alarm {
  id: number;
  message: string;
  severity: number;
  timestamp: Date;
}

interface TTSConfig {
  enabled: boolean;
  voice: string;
  speed: number;
  volume: number;
  maxQueueSize: number;
  announceTypes: {
    alarms: boolean;
    status: boolean;
    init: boolean;
  };
  severityFilter: {
    critical: boolean;
    warning: boolean;
    info: boolean;
  };
  language: string;
}

export class WinCCOATTSIntegration {
  private tts: TTSService;
  private config: TTSConfig;
  private availableVoices: string[] = [];
  private isInitialized = false;
  
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
    
    this.tts = new TTSService();
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
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
    } catch (error) {
      console.error('Error initializing TTS Integration:', error);
    }
  }
  
  // Method to update configuration from WinCC OA
  updateConfiguration(configJson: string): void {
    try {
      const newConfig: TTSConfig = JSON.parse(configJson);
      
      // Validate configuration
      if (this.validateConfig(newConfig)) {
        this.config = { ...this.config, ...newConfig };
        this.applyConfiguration();
        console.log('TTS Configuration updated:', this.config);
      } else {
        console.error('Invalid TTS configuration received');
      }
    } catch (error) {
      console.error('Error parsing TTS configuration:', error);
    }
  }
  
  private validateConfig(config: Partial<TTSConfig>): boolean {
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
  
  private applyConfiguration(): void {
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
  getCurrentConfiguration(): string {
    return JSON.stringify({
      ...this.config,
      availableVoices: this.availableVoices,
      currentQueueLength: this.tts.getQueueLength(),
      isSpeaking: this.tts.isSpeechActive(),
      isInitialized: this.isInitialized
    });
  }
  
  // Check if the integration is fully initialized
  isReady(): boolean {
    return this.isInitialized;
  }
  
  // Method to be called from WinCC OA when an alarm occurs
  async announceAlarm(alarm: Alarm): Promise<void> {
    if (!this.config.enabled || !this.config.announceTypes.alarms) {
      return;
    }
    
    // Check severity filter
    const shouldAnnounce = (
      (alarm.severity === 1 && this.config.severityFilter.critical) ||
      (alarm.severity === 2 && this.config.severityFilter.warning) ||
      (alarm.severity >= 3 && this.config.severityFilter.info)
    );
    
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
      case 1: prefix = "Critical alert: "; break;
      case 2: prefix = "Warning: "; break;
      default: prefix = "Information: ";
    }
    
    // Use urgent speak for critical alarms
    if (alarm.severity === 1 && 'speakUrgent' in this.tts) {
      await (this.tts as any).speakUrgent(prefix + alarm.message);
    } else {
      await this.tts.speak(prefix + alarm.message);
    }
  }
  
  // Announce system status
  async announceStatus(status: string): Promise<void> {
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
  async announceInit(message: string): Promise<void> {
    if (!this.config.enabled || !this.config.announceTypes.init) {
      return;
    }
    
    await this.tts.speak(`System initial state: ${message}`);
  }
  
  // Stop any current announcement
  async stopAnnouncement(): Promise<void> {
    await this.tts.stop();
  }
  
  // Clear the announcement queue
  clearQueue(): void {
    this.tts.clearQueue();
  }
  
  // Get TTS status for monitoring
  getStatus(): { enabled: boolean; speaking: boolean; queueLength: number } {
    return {
      enabled: this.config.enabled,
      speaking: this.tts.isSpeechActive(),
      queueLength: this.tts.getQueueLength()
    };
  }
}