const say = require('say')

interface QueuedAnnouncement {
  text: string;
  voice?: string;
  speed?: number;
  volume?: number;
  resolve: () => void;
  reject: (error: Error) => void;
}

export class TTSService {
  private defaultVoice: string | undefined;
  private defaultSpeed: number = 1.0;
  private defaultVolume: number = 100; // Keep for future use
  private maxQueueSize: number = 5;
  private isSpeaking = false;
  private queue: QueuedAnnouncement[] = [];
  
  constructor(defaultVoice?: string, defaultSpeed?: number) {
    this.defaultVoice = defaultVoice;
    if (defaultSpeed) this.defaultSpeed = defaultSpeed;
  }
  
  async speak(text: string, voice?: string, speed?: number, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check queue size before adding
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('TTS queue is full'));
        return;
      }
      
      const announcement: QueuedAnnouncement = {
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
  
  private processQueue(): void {
    if (this.queue.length === 0 || this.isSpeaking) {
      return;
    }
    
    const announcement = this.queue.shift();
    if (!announcement) return;
    
    this.isSpeaking = true;
    const voiceToUse = announcement.voice || this.defaultVoice;
    const speedToUse = announcement.speed || this.defaultSpeed;
    const volumeToUse = announcement.volume || this.defaultVolume;

    console.log(`Speaking: "${announcement.text}" with voice: ${voiceToUse}, speed: ${speedToUse}, volume: ${volumeToUse} (volume not supported by say library)`);
    
    // Note: say library doesn't support volume, so we only use voice and speed
    say.speak(announcement.text, voiceToUse, speedToUse, (err?: string) => {
      this.isSpeaking = false;
      if (err) {
        console.error('TTS Error:', err);
        announcement.reject(new Error(err));
      } else {
        console.log('Speech completed successfully');
        announcement.resolve();
      }
      
      setTimeout(() => this.processQueue(), 100);
    });
  }
  
  async stop(): Promise<void> {
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
  
  async getAvailableVoices(): Promise<string[]> {
    return new Promise((resolve) => {
      say.getInstalledVoices((err?: string, voices?: string[]) => {
        if (err) {
          console.error("Error getting installed voices:", err);
          resolve([]);
        } else {
          resolve(voices || []);
        }
      });
    });
  }

  setDefaultVoice(voice: string): void {
    this.defaultVoice = voice;
  }

  setDefaultSpeed(speed: number): void {
    this.defaultSpeed = speed;
  }

  setDefaultVolume(volume: number): void {
    this.defaultVolume = volume;
    console.log(`Volume set to ${volume}% (note: not supported by say library)`);
  }

  setMaxQueueSize(size: number): void {
    this.maxQueueSize = size;
  }

  isSpeechActive(): boolean {
    return this.isSpeaking;
  }
  
  getQueueLength(): number {
    return this.queue.length;
  }
  
  clearQueue(): void {
    this.queue.forEach(announcement => {
      announcement.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}