import {
  WinccoaManager,
  WinccoaConnectUpdateType,
  WinccoaError,
  WinccoaCtrlScript,
} from 'winccoa-manager';
import { WinCCOATTSIntegration } from './lib/ttsIntegration';
import { Message } from './lib/services/ttsService';

const winccoa = new WinccoaManager();
const ttsIntegration = new WinCCOATTSIntegration(winccoa);
let filteredDps: string[] = [];
let dpName = 'TTS_engine_0';
let manNumber = 0;
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
    console.error('Value connection error:', error);
    return;
  }

  for (let i = 0; i < names.length; i++) {
    if (ttsIntegration.isReady()) {
      const message = JSON.parse(String(values[i])) as Message;
      if (message.dpe && filteredDps.includes(message.dpe) || message.managerNumber === manNumber || message.managerNumber === 0) {
        ttsIntegration.addAnnouncement(message)
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

  const script = new WinccoaCtrlScript(
    winccoa,
    `int main()
     {
        char manType, manNum;
        int manID = myManId();
        getManIdFromInt(manID, manType, manNum);
        return (int)manNum;
     }`,
    'example script'
  );
  manNumber = await script.start() as number;
  console.log(`Manager Number determined: ${manNumber}`);
  dpName = `TTS_engine_${manNumber}`;

  // Publish current configuration to WinCC OA
  const currentConfig = ttsIntegration.getCurrentConfiguration();
  console.log('Publishing initial TTS Configuration to WinCC OA:', currentConfig);

  try {
    await winccoa.dpSetWait([`${dpName}.config`], [currentConfig]);
    console.log('Successfully published initial TTS configuration to WinCC OA');
  } catch (error) {
    console.error('Failed to publish initial TTS configuration:', error);
  }

  // Now connect to datapoints after initialization is complete
  console.log("Connecting to WinCC OA datapoints...");
  winccoa.dpConnect(updateFilterCB, [
    `${dpName}.filter`
  ], true);

  // Connect to TTS configuration datapoint
  winccoa.dpConnect(configConnectCB, [
    `${dpName}.config`
  ], false);

  // Connect to value datapoints that should trigger TTS announcements
  winccoa.dpConnect(valueConnectCB, [
    `Text2SpeechMsg.message`,
  ], false);

  console.log("WinCC OA Text-to-Speech Service fully started and connected");
}

main().catch(console.error);

function updateFilterCB(names: string[],
  values: unknown[],
  type: WinccoaConnectUpdateType,
  error?: WinccoaError) {
  const filter = values[0] as string;
  const filterFn = createFilterFunction(filter);
  filteredDps = winccoa.dpNames('*.**', "").filter(filterFn);
  winccoa.dpSetWait(`${dpName}.dpes`, filteredDps);
}

let lastValidFilterFn: (name: string) => boolean = () => true;

function createFilterFunction(userCondition: string): (name: string) => boolean {
  const trimmed = userCondition.trim();

  // Return previous filter if the condition is empty
  if (!trimmed) {
    return lastValidFilterFn;
  }

  try {
    let fn: (name: string) => boolean;
    if (/\breturn\b/.test(trimmed)) {
      fn = new Function('name', trimmed) as (name: string) => boolean;
    } else {
      fn = new Function('name', `return (${trimmed});`) as (name: string) => boolean;
    }

    // Test the function with a sample value to catch runtime errors early
    fn('test');
    lastValidFilterFn = fn;
    return fn;
  } catch (error) {
    console.error(`Invalid filter expression: "${userCondition}". Error: ${error}. Keeping previous filter.`);
    return lastValidFilterFn;
  }
}