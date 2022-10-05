import { Interaction } from 'discord.js';

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

global.bot.on('interactionCreate', async (rawInteraction: Interaction) => {
	if (rawInteraction.isChatInputCommand()) {
		let str_command = `${rawInteraction.commandName} ${rawInteraction.options.getSubcommandGroup(
			false
		)} ${rawInteraction.options.getSubcommand(false)}`;
		str_command = str_command.replaceAll('null', '').replaceAll('undefined', '').replaceAll('  ', ' ').trim();
		global.logger.trace('Received command `' + str_command + '`');

		if (
			global.chatInputCommandInteractions !== undefined &&
			global.chatInputCommandInteractions[str_command] !== undefined
		) {
			global.logger.trace('Calling `' + str_command + '`');
			global.chatInputCommandInteractions[str_command](rawInteraction);
		} else {
			global.logger.warn('Received command `' + str_command + '` but cannot find it!');
			global.logger.trace(global.chatInputCommandInteractions);
		}
	} else if (rawInteraction.isButton()) {
		global.buttonInteractions[rawInteraction.customId](rawInteraction);
	}
});

global.functions['getInteractionArgumentByName'] = function (p_arguments: Array<any>, p_varName: string) {
	let arg = p_arguments.filter((argument) => argument.name === p_varName);
	if (arg.length > 0) {
		return p_arguments.filter((argument) => argument.name === p_varName)[0];
	} else {
		return { name: undefined, type: -1, value: undefined };
	}
};

global.CommandTypes = {
	UNDEFINED: -1, // Custom
	SUB_COMMAND: 1,
	SUB_COMMAND_GROUP: 2,
	STRING: 3,
	INTEGER: 4,
	BOOLEAN: 5,
	USER: 6,
	CHANNEL: 7,
	ROLE: 8,
	MENTIONABLE: 9,
	NUMBER: 10,
	ATTACHMENT: 11,
};

global.registerRequiredCommands = async function () {
	if (global.registeredPublicCommands === false) {
		global.registerCommands(true);
	}
	if (global.registeredPrivateCommands === false) {
		global.registerCommands(false);
	}
};

global.registerCommands = async function (p_public = false) {
	if (p_public === true) {
		global.registeredPublicCommands = true;
	} else {
		global.registeredPrivateCommands = true;
	}
	const rest = new REST({ version: '10' }).setToken(global.settings.DiscordToken);
	let commands = Object.keys(global.commands).map((key) => {
		return global.commands[key];
	});
	// Filter based on isPublic of each command, and on DevelopmentOverrides in the settings
	if (p_public === true) {
		commands = commands.filter(
			(command) => command.isPublic === p_public && global.settings.DevelopmentOverrides !== true
		);
	} else {
		commands = commands.filter(
			(command) => command.isPublic === p_public || global.settings.DevelopmentOverrides === true
		);
	}
	let commandBody = commands.map((command) => command.command.toJSON());
	global.logger.trace(commandBody);
	if (global.registeredSlashCommandInteractionsPublic === undefined) {
		global.registeredSlashCommandInteractionsPublic = [];
	}
	if (global.registeredSlashCommandInteractionsPrivate === undefined) {
		global.registeredSlashCommandInteractionsPrivate = [];
	}
	if (p_public) {
		let returnvalue = await rest.put(Routes.applicationCommands(global.settings.DiscordClientId), {
			body: commandBody,
		});
		global.registeredSlashCommandInteractionsPublic = returnvalue;
	} else {
		let returnvalue = await rest.put(
			Routes.applicationGuildCommands(global.settings.DiscordClientId, '413371076962156554'),
			{
				body: commandBody,
			}
		);
		global.registeredSlashCommandInteractionsPrivate = returnvalue;
	}
	global.registeredSlashCommandInteractions = global.registeredSlashCommandInteractionsPublic.concat(
		global.registeredSlashCommandInteractionsPrivate
	);
};
