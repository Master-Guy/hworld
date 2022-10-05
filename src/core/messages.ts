import { Attachment, CategoryChannel, Message, TextChannel } from 'discord.js';
import { FieldInfo, MysqlError } from 'mysql';

let deleteCallbackFunction = function (error: MysqlError | null, results: any, fields: FieldInfo[]) {
	if (error !== null) {
		global.logger.error(error);
	} else {
		// console.log('Deleted successfully.');
	}
};

async function parseDeletedMessage(deletedMessage: Message) {
	// console.dir(deletedMessage.attachments);
	deletedMessage.attachments.forEach((attachment) => {
		// console.log('Deleting attachment ' + attachment.id + '.');
		global.database.delete('attachments', 'attachmentId = ?', [attachment.id], deleteCallbackFunction);
	});
}

global.bot.on('messageDelete', async (deletedMessage: Message) => {
	parseDeletedMessage(deletedMessage);
});
global.bot.on('messageDeleteBulk', async (deletedMessages: Array<Message>) => {
	deletedMessages.forEach((deletedMessage: Message) => {
		parseDeletedMessage(deletedMessage);
	});
});

global.parseMessageAttachments = function (rawMessage: Message) {
	if (rawMessage.guildId !== null) {
		// Guild message
		let upsertCallbackFunction = function (error: MysqlError | null, results: any, fields: FieldInfo[]) {
			if (error !== null) {
				global.logger.error(error);
			}
		};

		// Save the author name
		let author = rawMessage.author;
		global.database.upsert('authors', { authorId: author.id, authorName: author.username }, upsertCallbackFunction);

		// Save the guild name
		global.database.upsert(
			'guilds',
			{ guildId: rawMessage.guildId, guildName: rawMessage.guild?.name },
			upsertCallbackFunction
		);

		// Save the category name
		let channel: TextChannel = global.bot.channels.cache.get(rawMessage.channelId);
		let category: CategoryChannel | null = channel.parent;
		if (category !== null) {
			global.database.upsert(
				'categories',
				{ categoryId: category.id, categoryName: category.name, guildId: category.guildId },
				upsertCallbackFunction
			);
		}

		// Save the channel name
		global.database.upsert(
			'channels',
			{ channelId: channel.id, channelName: channel.name, categoryId: channel.parentId },
			upsertCallbackFunction
		);

		// Save each attachment
		rawMessage.attachments.forEach((attachment: Attachment) => {
			// console.log(attachment.url);
			global.database.upsert(
				'attachments',
				{
					attachmentId: attachment.id,
					channelId: channel.id,
					messageId: rawMessage.id,
					authorId: author.id,
					attachmentUrl: attachment.url,
				},
				upsertCallbackFunction
			);
		});
	}
};

global.bot.on('messageCreate', async (rawMessage: Message) => {
	global.parseMessageAttachments(rawMessage);
});
