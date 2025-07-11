import {
  WinccoaManager,
  WinccoaConnectUpdateType,
  WinccoaError,
} from 'winccoa-manager';
import { WinCCOATTSIntegration } from './lib/ttsIntegration';

const winccoa = new WinccoaManager();
const ttsIntegration = new WinCCOATTSIntegration();

function connectCB(
  names: string[],
  values: unknown[],
  type: WinccoaConnectUpdateType,
  error?: WinccoaError
) {
  if (error) {
    console.log(error);
    return;
  }

  let bInitUpdate: boolean = false;

  if (type == WinccoaConnectUpdateType.Answer) {
    console.log('--- Initial update ---');
    bInitUpdate = true;
  }

  for (let i = 0; i < names.length; i++) {
    console.info(`[${i}] '${names[i]}' : ${values[i]}`);
    
    // Example: Announce datapoint changes via TTS
    const message = `Datapoint ${names[i]} changed to ${values[i]}`;
    if (bInitUpdate)
      ttsIntegration.announceInit(message);
    else
      ttsIntegration.announceStatus(message);
  }
}

async function main() {
  console.log("WinCC OA Text-to-Speech Service Starting...");
  
  // Announce startup
  await ttsIntegration.announceStatus("Text to Speech service started");
  
  // Connect to WinCC OA datapoints
  winccoa.dpConnect(connectCB, ['ExampleDP_Arg1.', 'ExampleDP_Arg2.'], true);
}

main().catch(console.error);