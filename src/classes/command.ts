import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

let Command = class {
	public command: SlashCommandBuilder;
	private _public: boolean;
	private _name: string;
	private _description: string;
	private _test: Function | undefined = undefined;
	public static TestResults: { OK: number; PARTIAL: number; FAILED: number; HIDDEN: number } = {
		OK: 2,
		PARTIAL: 1,
		FAILED: 0,
		HIDDEN: -1,
	};

	constructor(p_public: boolean, p_name: string, p_description: string) {
		this._public = p_public; // Global commands are registered as application command, while private commands are only registered to the testing guild
		if (global.settings.DevelopmentOverrides.toLowerCase() === 'true') {
			this._name = 'tdd_' + p_name;
		} else {
			this._name = p_name;
		}
		this._description = p_description;
		this.command = new SlashCommandBuilder()
			.setName(this._name)
			.setDescription(this._description)
			.setDMPermission(false);

		if (typeof this._public !== 'boolean') {
			this._public = false;
		}

		global.commands[this._name] = this;

		if (this._public) {
			global.registeredPublicCommands = false;
		} else {
			global.registeredPrivateCommands = false;
		}
	}

	get name(): string {
		return this._name;
	}

	get description(): string {
		return this._description;
	}

	get isPublic() {
		global.logger.trace('Returning isPublic for ' + this._name + ' as ' + this._public);
		return this._public === true;
	}

	addSlashCommandInteractionResponseFunction(p_function: { subcommand: any; function: Function }) {
		let fullCommandName = (this._name + ' ' + p_function.subcommand)
			.replaceAll('null', '')
			.replaceAll('undefined', '')
			.replaceAll('  ', ' ')
			.trim();
		if (p_function.subcommand.indexOf('null') >= 0) {
			global.logger.error(
				`⚠️ Unable to register interaction function \`${fullCommandName}\` because it contains 'null'.`
			);
			return;
		}
		if (p_function.subcommand.indexOf('undefined') >= 0) {
			global.logger.error(
				`⚠️ Unable to register interaction function \`${fullCommandName}\` because it contains 'undefined'.`
			);
			return;
		}
		if (p_function.function.constructor.name === 'AsyncFunction') {
			global.logger.debug('Registering interaction function `' + fullCommandName + '`');
			global.chatInputCommandInteractions[fullCommandName] = p_function.function;
		} else {
			global.logger.error(
				`⚠️ Unable to register interaction function \`${fullCommandName}\` because it is not an async function.`
			);
		}
	}

	addTestFunction(p_function: Function) {
		this._test = p_function;
		return true;
	}

	test(rawInteraction: ChatInputCommandInteraction): { ok: number; message: string } | undefined {
		if (this._test === undefined) {
			return undefined;
		}
		try {
			return this._test(rawInteraction);
		} catch (err) {
			console.dir(err);
			return { ok: Command.TestResults.FAILED, message: 'Unknown error' };
		}
	}
};

module.exports = Command;
