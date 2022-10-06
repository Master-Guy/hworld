const ApplicationCommandPermissionMap = global.functions.requireIfExists('/classes/ApplicationCommandPermissionMap.ts');
const Command = global.functions.requireIfExists('/classes/command.ts');

import {
	ChatInputCommandInteraction,
	Collection,
	Message,
	PermissionFlagsBits,
	SlashCommandSubcommandBuilder,
	TextChannel,
} from 'discord.js';

let cmd = new Command(
	true, // public
	'scanhistory', // name
	'Scan the historical messages, up to 100 and up to 2 weeks old' // description
);

cmd.command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

cmd.command.addSubcommand((option: SlashCommandSubcommandBuilder) =>
	option.setName('channel').setDescription('Scan only this channel')
);
cmd.command.addSubcommand((option: SlashCommandSubcommandBuilder) =>
	option.setName('server').setDescription('Scan all channels in this server')
);

cmd.addTestFunction(async function (rawInteraction: ChatInputCommandInteraction) {
	// Check against interaction permissions
	let isAllowed = await new ApplicationCommandPermissionMap(rawInteraction.guildId).isAllowed(
		cmd.name,
		rawInteraction.guild?.members.cache.get(rawInteraction.user.id),
		rawInteraction.channel
	);
	if (isAllowed.ok === ApplicationCommandPermissionMap.TestResults.DENIED) {
		return { ok: Command.TestResults.FAILED, message: isAllowed.message };
	}
	// Return default
	return { ok: Command.TestResults.OK, message: cmd.description };
});

async function parseMessages(
	rawInteraction: ChatInputCommandInteraction,
	channelId: string,
	messages: Collection<string, Message>
) {
	rawInteraction.editReply({ content: `⏳ Parsing ${messages.size} messages for <#${channelId}>` });
	messages.forEach((message: Message) => {
		global.parseMessageAttachments(message);
	});
}

cmd.addSlashCommandInteractionResponseFunction({
	subcommand: 'channel',
	function: async (rawInteraction: ChatInputCommandInteraction) => {
		if (rawInteraction.channel === null) {
			rawInteraction.reply({ content: '🛑 This does not work from a DM', ephemeral: true });
			return;
		}
		await rawInteraction.reply({ content: '⏳ Scanning', ephemeral: true });
		let msgChannel: TextChannel = global.bot.channels.cache.get(rawInteraction.channelId);
		await msgChannel.messages
			.fetch()
			.then(async (messages) => {
				console.log(`Received ${messages.size} messages`);
				await parseMessages(rawInteraction, rawInteraction.channelId, messages);
			})
			.catch(console.error);
		rawInteraction.editReply('✅ Completed scanning this channel');
	},
});

cmd.addSlashCommandInteractionResponseFunction({
	subcommand: 'server',
	function: async (rawInteraction: ChatInputCommandInteraction) => {
		if (rawInteraction.channel === null) {
			rawInteraction.reply({ content: '🛑 This does not work from a DM', ephemeral: true });
			return;
		}
		await rawInteraction.reply({ content: '⏳ Fetching channels', ephemeral: true });
		let guild = rawInteraction.guild;
		if (guild === null) {
			rawInteraction.reply({ content: '⁉️ Could not find the guild', ephemeral: true });
			return;
		}
		let channels = guild.channels.cache;
		//console.dir(channels);
		for (const [channelId, channel] of channels) {
			console.log('Channel ID: ' + channelId + '; Name: ' + channel.name);
			let msgChannel: TextChannel = global.bot.channels.cache.get(channelId);
			if (msgChannel.messages !== undefined) {
				//console.dir(msgChannel);
				await msgChannel.messages
					.fetch({ limit: 100, cache: false })
					.then(async (messages) => {
						console.log(`Received ${messages.size} messages in channel ${channelId}`);
						await parseMessages(rawInteraction, channelId, messages);
					})
					.catch(console.error);
			}
		}
		rawInteraction.editReply('✅ Completed scanning the server');
	},
});
