declare module 'say' {
  export function speak(text: string, voice?: string, speed?: number, callback?: (err?: string) => void): void;
  export function stop(): void;
  export function getInstalledVoices(callback: (err?: string, voices?: string[]) => void): void;
  // export function export(text: string, voice: string, speed: number, filename: string, callback: (err?: Error) => void): void;
}
