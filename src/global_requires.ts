import { ApplicationCommandPermissionType } from 'discord.js';
if (global.functions === undefined) {
	global.functions = {};
}
if (global.chatInputCommandInteractions === undefined) {
	global.chatInputCommandInteractions = {};
}
if (global.commands === undefined) {
	global.commands = {};
}
if (global.buttonCommands === undefined) {
	global.buttonCommands = {};
}
if (global.buttonInteractions === undefined) {
	global.buttonInteractions = {};
}
if (global.queue === undefined) {
	global.queue = {};
}
if (global.queue.delayedCalls === undefined) {
	global.queue.delayedCalls = [];
}
if (global.acpMaps === undefined) {
	//                       guild       permId        PermissionArray
	global.acpMaps = new Map<string, Map<string, Array<ApplicationCommandPermissionType>>>();
}

global.fs = require('fs');
require('./global/error_codes.ts');
require('./global/func_settings.ts');
global.functions.requireIfExists = require('./core/requireIfExists.ts').function;
global.functions.readIfExists = require('./core/readIfExists.ts').function;
global.sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
