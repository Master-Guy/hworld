if (global.settings.DiscordToken === undefined) {
	global.logger.fatal('No Discord token was provided in the settings!');
	process.exit();
} else {
	global.logger.debug('Discord token used is ' + global.settings.DiscordToken);

	// Require the necessary discord.js classes
	const { Client, GatewayIntentBits } = require('discord.js');

	// Create a new client instance
	// https://github.com/discordjs/discord-api-types/blob/9af4b4776bde5efb0090ca1bf05a651f6a750b07/gateway/v6.ts#L114
	global.bot = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			// GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			// GatewayIntentBits.GuildMessageReactions,
			// GatewayIntentBits.GuildMessageTyping,
			// GatewayIntentBits.DirectMessages,
			// GatewayIntentBits.DirectMessageReactions,
			// GatewayIntentBits.DirectMessageTyping,
		],
	});

	// Logging all incoming raw messages
	global.bot.on('raw', (rawMessage: { t: string | null; s: number | null; op: number; d: any }) => {
		// Ignore system PING messages
		if (rawMessage.op !== 11) {
			// Log the raw message for tracing purposes
			global.logger.trace(JSON.stringify(rawMessage));
		}
	});

	// When the client is ready, run this code (only once)
	global.bot.once('ready', () => {
		global.logger.info('✅ DiscordJS ready!');
	});

	// Load generic modules before logging in
	global.functions.requireIfExists('/core/queue.ts');
	global.functions.requireIfExists('/core/interactions.ts');
	global.functions.requireIfExists('/core/messages.ts');
	global.functions.requireIfExists('/core/commands_startup.ts');

	// Connect to the database
	const Database = global.functions.requireIfExists('/classes/database.ts');
	if (global.database === undefined) {
		global.database = new Database();
	}

	// Login to Discord with your client's token
	global.bot.login(global.settings.DiscordToken);

	// Start timed scripts
	global.functions.requireIfExists('/core/schedules.ts');
}

global.bot.stopBot = function (p_errorcode: { code: number; message: string }) {
	if (global.database.connectionPool !== undefined) {
		global.logger.warn('Killing all database connections...');
		global.database.connectionPool.end();
		global.logger.info('Killed all database connections!');
	}
	process.exitCode = p_errorcode.code;
	global.bot.destroy();
	process.exit(p_errorcode.code);
};
