import {
  WinccoaManager,
  WinccoaConnectUpdateType,
  WinccoaError,
} from 'winccoa-manager';
import { WinCCOATTSIntegration } from './lib/ttsIntegration';

const winccoa = new WinccoaManager();
const ttsIntegration = new WinCCOATTSIntegration();

// Callback for TTS configuration updates
function configConnectCB(
  names: string[],
  values: unknown[],
  type: WinccoaConnectUpdateType,
  error?: WinccoaError
) {
  if (error) {
    console.log('Config connection error:', error);
    return;
  }

  console.warn('--- TTS Config update ---');
  ttsIntegration.updateConfiguration(values[0] as string);
}

// Callback for regular datapoint value changes
function valueConnectCB(
  names: string[],
  values: unknown[],
  type: WinccoaConnectUpdateType,
  error?: WinccoaError
) {
  if (error) {
    console.log('Value connection error:', error);
    return;
  }

  console.warn('--- Value Datapoints update ---');

  for (let i = 0; i < names.length; i++) {
    console.info(`Value [${i}] '${names[i]}' : ${values[i]}`);
    
    // Only announce if TTS is ready
    if (ttsIntegration.isReady()) {
      const message = `Datapoint ${names[i]} changed to ${values[i]}`;
      if (type == WinccoaConnectUpdateType.Answer) {
        ttsIntegration.announceInit(message);
      } else {
        ttsIntegration.announceStatus(message);
      }
    }
  }
}

async function main() {
  console.log("WinCC OA Text-to-Speech Service Starting...");
  
  // Wait for TTS integration to be fully initialized
  const waitForInitialization = () => {
    return new Promise<void>((resolve) => {
      const checkInitialization = () => {
        if (ttsIntegration.isReady()) {
          console.log("TTS Integration fully initialized");
          resolve();
        } else {
          console.log("Waiting for TTS initialization...");
          setTimeout(checkInitialization, 500);
        }
      };
      checkInitialization();
    });
  };

  // Wait for initialization
  await waitForInitialization();
  
  // Announce startup
  await ttsIntegration.announceStatus("Text to Speech service started");
  
  // Publish current configuration to WinCC OA
  const currentConfig = ttsIntegration.getCurrentConfiguration();
  console.log('Publishing initial TTS Configuration to WinCC OA:', currentConfig);
  
  try {
    await winccoa.dpSetWait(['TTS_engine_config.'], [currentConfig]);
    console.log('Successfully published initial TTS configuration to WinCC OA');
  } catch (error) {
    console.error('Failed to publish initial TTS configuration:', error);
  }

  // Now connect to datapoints after initialization is complete
  console.log("Connecting to WinCC OA datapoints...");
  
  // Connect to TTS configuration datapoint
  winccoa.dpConnect(configConnectCB, [
    'TTS_engine_config.'  // Configuration datapoint
  ], false);
  
  // Connect to value datapoints that should trigger TTS announcements
  winccoa.dpConnect(valueConnectCB, [
    'ExampleDP_Arg1.',
    'ExampleDP_Arg2.'
  ], true);
  
  console.log("WinCC OA Text-to-Speech Service fully started and connected");
}

main().catch(console.error);