import { TTSService, Message } from './services/ttsService';
import { WinccoaManager } from 'winccoa-manager';

interface TTSConfig {
  voice: string;
  speed: number;
  maxQueueSize: number;
  language: string;
  availableVoices: string[];
  isInitialized: boolean;
}

export class WinCCOATTSIntegration {
  private tts: TTSService;
  private config: TTSConfig;
  
  constructor(winccoa: WinccoaManager) {
    this.config = {
      voice: '',
      speed: 1.0,
      maxQueueSize: 5,
      language: 'en-US',
      availableVoices: [],
      isInitialized: false
    };
    
    this.tts = new TTSService();
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
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
    } catch (error) {
      console.error('Error initializing TTS Integration:', error);
      // Still mark as initialized even if voice discovery fails
      this.config.isInitialized = true;
    }
  }
  
  // Method to update configuration from WinCC OA
  updateConfiguration(configJson: string): void {
    try {
      const newConfig: Partial<TTSConfig> = JSON.parse(configJson);
      
      delete newConfig.availableVoices;
      delete newConfig.isInitialized;
      
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
  
  private applyConfiguration(): void {
    // Apply settings to TTS service
    if (this.config.voice) {
      this.tts.setDefaultVoice(this.config.voice);
    }
    
    if (this.config.speed) {
      this.tts.setDefaultSpeed(this.config.speed);
    }

    // Apply max queue size - this will automatically trim the queue if needed
    if (this.config.maxQueueSize !== undefined) {
      this.tts.setMaxQueueSize(this.config.maxQueueSize);
    }
  }
  
  public async addAnnouncement(message: Message): Promise<void> {
    if (!this.config.isInitialized) {
      console.warn('TTS Integration not initialized yet, cannot add announcement');
      return;
    }
    
    try {
      this.tts.add(message);
      console.log('Announcement added to TTS queue:', message);
    } catch (error) {
      console.error('Error adding announcement to TTS queue:', error);
    }
  }

  private validateConfig(config: Partial<TTSConfig>): boolean {
    // Validate speed range
    if (config.speed !== undefined && (config.speed < 0.1 || config.speed > 3.0)) {
      console.error('Invalid speed range:', config.speed);
      return false;
    }
    
    // Validate max queue size (0 is allowed temporarily for clearing queue)
    if (config.maxQueueSize !== undefined && (config.maxQueueSize < 0 || config.maxQueueSize > 50)) {
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
  getCurrentConfiguration(): string {
    return JSON.stringify(this.config);
  }
  
  // Separate method for runtime status if needed for debugging/monitoring
  getRuntimeStatus(): { queueLength: number; speaking: boolean } {
    return {
      queueLength: this.tts.getQueueLength(),
      speaking: this.tts.isSpeechActive()
    };
  }
  
  // Check if the integration is fully initialized
  isReady(): boolean {
    return this.config.isInitialized;
  }
  
  // Clear the announcement queue
  clearQueue(): void {
    this.tts.clearQueue();
  }
  
  // Get TTS status for monitoring
  getStatus(): { speaking: boolean; queueLength: number } {
    return {
      speaking: this.tts.isSpeechActive(),
      queueLength: this.tts.getQueueLength()
    };
  }
}
