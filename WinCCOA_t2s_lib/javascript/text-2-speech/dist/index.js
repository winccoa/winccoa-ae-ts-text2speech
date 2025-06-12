"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winccoa_manager_1 = require("winccoa-manager");
const winccoa = new winccoa_manager_1.WinccoaManager();
function connectCB(names, values, type, error) {
    if (error) {
        console.log(error);
        return;
    }
    if (type == winccoa_manager_1.WinccoaConnectUpdateType.Answer)
        console.warn('--- Initial update ---');
    for (let i = 0; i < names.length; i++)
        console.info(`[${i}] '${names[i]}' : ${values[i]}`);
}
function main() {
    console.log("Hello, World!");
    winccoa.dpConnect(connectCB, ['ExampleDP_Arg1.', 'ExampleDP_Arg2.'], true);
}
main();
