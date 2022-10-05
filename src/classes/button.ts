import { ButtonBuilder, ButtonStyle } from 'discord.js';

let Button = class {
	public button: ButtonBuilder;
	private _name: string;
	private _description: string;
	private _style: ButtonStyle;

	constructor(p_name: string, p_description: string, p_buttonStyle: ButtonStyle) {
		this._name = p_name;
		this._description = p_description;
		this._style = p_buttonStyle;
		this.button = new ButtonBuilder().setCustomId(this._name).setLabel(this._description).setStyle(this._style);

		global.buttonCommands[this._name] = this;
	}

	addSlashCommandInteractionResponseFunction(p_function: { function: Function }) {
		if (p_function.function.constructor.name === 'AsyncFunction') {
			global.logger.debug('Registering button interaction function `' + this._name + '`');
			global.buttonInteractions[this._name] = p_function.function;
		} else {
			global.logger.error(
				`⚠️ Unable to register button interaction function \`${this._name}\` because it is not an async function.`
			);
		}
	}
};

module.exports = Button;
