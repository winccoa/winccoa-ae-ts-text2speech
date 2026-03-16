import { Heap } from 'heap-js';
const say = require('say')

export interface Message {
  managerNumber?: number;
  dpe?: string;
  text: string;
  voice?: string;
  speed?: number;
  priority: number;
}

export class TTSService {
  private defaultVoice: string | undefined;
  private defaultSpeed: number = 1.0;
  private maxQueueSize: number = 5;
  private isSpeaking = false;
  private queue: Heap<Message> = new Heap<Message>((a: Message, b: Message) => b.priority - a.priority);

  constructor(defaultVoice?: string, defaultSpeed?: number) {
    this.defaultVoice = defaultVoice;
    if (defaultSpeed) this.defaultSpeed = defaultSpeed;
  }

  add(announcement: Message): void {
    // Check if queue is at max capacity
    if (this.queue.size() >= this.maxQueueSize) {
      // Get the lowest priority message in the queue
      const queueArray = this.queue.toArray();
      const lowestPriorityMsg = queueArray.reduce((lowest, current) => 
        current.priority < lowest.priority ? current : lowest
      );

      // Only add if new message has higher priority than lowest in queue
      if (announcement.priority > lowestPriorityMsg.priority) {
        // Remove the lowest priority message
        const newQueue = new Heap<Message>((a: Message, b: Message) => b.priority - a.priority);
        queueArray.forEach(msg => {
          if (msg !== lowestPriorityMsg) {
            newQueue.push(msg);
          }
        });
        this.queue = newQueue;
        this.queue.push(announcement);
        console.log(`Queue full: Replaced priority ${lowestPriorityMsg.priority} message with priority ${announcement.priority} message`);
      } else {
        console.log(`Queue full: Dropped priority ${announcement.priority} message (queue lowest: ${lowestPriorityMsg.priority})`);
        return;
      }
    } else {
      this.queue.push(announcement);
    }
    
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.queue.size() === 0 || this.isSpeaking) {
      return;
    }

    const announcement = this.queue.pop();
    if (!announcement) return;

    this.isSpeaking = true;

    const voiceToUse = announcement.voice || this.defaultVoice;
    const speedToUse = announcement.speed || this.defaultSpeed;

    console.log(`Speaking (priority ${announcement.priority}): "${announcement.text}" with voice: ${voiceToUse}, speed: ${speedToUse}`);

    try {
      // Note: say.stop() does not work reliably on Windows SAPI
      // Messages will play in sequence without interruption
      await new Promise<void>((resolve, reject) => {
        say.speak(announcement.text, voiceToUse, speedToUse, (err?: string) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve();
          }
        });
      });

      console.log('Speech completed successfully');
    } catch (err) {
      console.error('TTS Error:', err);
    } finally {
      this.isSpeaking = false;
      // Process next message in queue
      this.processQueue();
    }
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

  setMaxQueueSize(size: number): void {
    this.maxQueueSize = size;
    // If new size is smaller than current queue, trim to fit
    if (this.queue.size() > size) {
      const queueArray = this.queue.toArray();
      // Keep only the highest priority messages
      queueArray.sort((a, b) => b.priority - a.priority);
      this.queue = new Heap<Message>((a: Message, b: Message) => b.priority - a.priority);
      for (let i = 0; i < size && i < queueArray.length; i++) {
        this.queue.push(queueArray[i]);
      }
      console.log(`Queue trimmed from ${queueArray.length} to ${size} messages`);
    }
  }

  getQueueLength(): number {
    return this.queue.size();
  }

  isSpeechActive(): boolean {
    return this.isSpeaking;
  }

  clearQueue(): void {
    this.queue.clear();
  }
}
