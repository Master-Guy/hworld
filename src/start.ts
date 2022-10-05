'use strict';

// Amount of EventEmitter listeners allowed.
// Do not set to infinite or 0, as this might crash the system the bot is running on.
// If exeeded, will cause Node to warn.
// Winston logging takes 11 loggers/event listeners
require('events').defaultMaxListeners = 11;

let path = require('path');
global.rootPath = path.resolve('src');
console.dir(global.rootPath);
require(global.rootPath + '/global_requires.ts');
require(global.rootPath + '/start_logging.ts');

let profilerBotStartup = global.logger.startTimer();

// Check parameters and running path of the bot
const myArgs = process.argv.slice(2);
global.logger.debug('myArgs: ', myArgs);
global.runningPath = __dirname.replace('\\', '/');
global.logger.debug('runningPath: ' + global.runningPath);

// Check if the environment is allowed
if (myArgs[0] !== 'prd' && myArgs[0] !== 'dev') {
	global.logger.fatal('Invalid environment: ' + myArgs[0]);
	process.exit(global.errorcodes.ERR_INVALID_ENVIRONMENT.code);
}

// Load the settings from file
require('dotenv').config();
global.settings = process.env;
/*
global.settingsFile = global.rootPath + '/settings.' + myArgs[0] + '.json';
global.functions['bot__readSettingsFile']();
global.logger.trace('Settings: ', global.settings);
*/

// Actually start up the bot
global.logger.info('Starting up bot...');
require(global.rootPath + '/core/bot.ts');
require(global.rootPath + '/core/api.ts');

// Show some statistics
profilerBotStartup.done({ message: 'Bot startup', level: 'info' });
