import {
  WinccoaManager,
  WinccoaConnectUpdateType,
  WinccoaError,
} from 'winccoa-manager';
const winccoa = new WinccoaManager();

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

  if (type == WinccoaConnectUpdateType.Answer)
    console.warn('--- Initial update ---');

  for (let i = 0; i < names.length; i++)
    console.info(`[${i}] '${names[i]}' : ${values[i]}`);
}

function main() {
    console.log("Hello, World!");
    winccoa.dpConnect(connectCB, ['ExampleDP_Arg1.', 'ExampleDP_Arg2.'], true);
}

main();