"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winccoa_manager_1 = require("winccoa-manager");
const ttsIntegration_1 = require("./lib/ttsIntegration");
const winccoa = new winccoa_manager_1.WinccoaManager();
const ttsIntegration = new ttsIntegration_1.WinCCOATTSIntegration();
function connectCB(names, values, type, error) {
    if (error) {
        console.log(error);
        return;
    }
    let bInitUpdate = false;
    if (type == winccoa_manager_1.WinccoaConnectUpdateType.Answer) {
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
