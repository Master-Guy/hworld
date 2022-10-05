import { APIApplicationCommandPermission, Channel, GuildMember, PermissionFlagsBits } from 'discord.js';

let ApplicationCommandPermissionMap = class {
	private _guild: string;
	private _everyone: string;
	private _allchannels: string;
	public static TestResults: { ALLOWED: number; OVERRIDE: number; DENIED: number; HIDDEN: number } = {
		ALLOWED: 2,
		OVERRIDE: 1,
		DENIED: 0,
		HIDDEN: -1,
	};

	constructor(p_guildId: string) {
		this._guild = p_guildId;
		this._everyone = p_guildId;
		this._allchannels = (BigInt(-1) + BigInt(p_guildId)).toString();
		return this;
	}

	async get(): Promise<Map<string, APIApplicationCommandPermission[]> | undefined> {
		if (!global.acpMaps.has(this._guild)) {
			await this.fetch();
		}
		return global.acpMaps.get(this._guild);
	}

	async fetch() {
		global.acpMaps.set(
			this._guild,
			await global.bot.application.commands.permissions.fetch({
				guild: this._guild,
			})
		);
		return global.acpMaps.get(this._guild);
	}

	async isAllowed(p_commandName: string, p_user: GuildMember, p_channel: Channel) {
		console.log('Testing isAllowed for ' + p_commandName);
		// Get command ID for command name
		let foundCommand = global.registeredSlashCommandInteractions.find((cmd) => {
			return cmd.name.toLowerCase() === p_commandName.toLowerCase();
		});
		//console.dir(foundCommand);
		let p_commandId = foundCommand.id;

		// Check if Administrator
		let isAdmin = p_user.permissions.has(PermissionFlagsBits.Administrator);
		if (isAdmin === true) {
			console.log('Allowing administrators');
			return { ok: ApplicationCommandPermissionMap.TestResults.ALLOWED, message: 'User is Administrator' };
		}

		let perms = await this.fetch();
		if (perms === undefined) {
			console.log('Unable to get permissions');
			return { ok: ApplicationCommandPermissionMap.TestResults.DENIED, message: 'Unable to get permissions' };
		}

		let havePermissions: number = ApplicationCommandPermissionMap.TestResults.ALLOWED;
		let havePermissionsMessage = '';

		let guildPermissions: APIApplicationCommandPermission[] | undefined = perms.get(
			global.settings.DiscordClientId
		);
		if (guildPermissions !== undefined) {
			// Everyone/all channels
			let guildGlobalRolePermissions = guildPermissions.find((permission) => {
				return permission.id === this._everyone;
			});
			if (guildGlobalRolePermissions !== undefined) {
				if (guildGlobalRolePermissions.permission === true) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = 'My commands are not allowed on this server.';
				}
			}
			let guildGlobalChannelPermissions = guildPermissions.find((permission) => {
				return permission.id === this._allchannels;
			});
			if (guildGlobalChannelPermissions !== undefined) {
				if (guildGlobalChannelPermissions.permission === true) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = 'My commands are not allowed in any channel.';
				}
			}
			console.log('Guild @everyone/#allChannels: ' + havePermissions);

			// Guild wide, role based
			let userRoles = p_user.roles.cache
				.filter((role, id) => {
					return id !== this._everyone && id !== this._allchannels;
				})
				.map((role) => role.id);
			let rolePermissions: APIApplicationCommandPermission[] | undefined = guildPermissions.filter(
				(permission) => {
					return userRoles.includes(permission.id);
				}
			);
			// Denied roles
			let deniedRole = rolePermissions.find((permission) => {
				return permission.permission === false;
			});
			if (deniedRole !== undefined) {
				havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
				havePermissionsMessage = `You are not allowed to use my commands based on your roles. (<@&${deniedRole.id}>)`;
			}
			// Allowed roles
			if (
				rolePermissions.find((permission) => {
					return permission.permission === true;
				}) !== undefined
			) {
				havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
			}
			console.log('Guild @roles: ' + havePermissions);

			// User specific
			let userPermissions = guildPermissions.find((permission) => {
				return permission.id === p_user.id;
			});
			if (userPermissions !== undefined) {
				if (userPermissions.permission === true) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = `You specifically are not allowed to use my commands.`;
				}
			}
			console.log('Guild @user: ' + havePermissions);

			// Generic permissions allowed in this channel?
			let channelPermissions = guildPermissions.find((permission) => {
				return permission.id === p_channel.id;
			});
			if (channelPermissions !== undefined) {
				if (channelPermissions.permission === true && havePermissions) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = `My commands cannot be used in this channel unless specifically approved by the administrators.`;
				}
			}
			console.log('Guild #channel: ' + havePermissions);
		}
		// Command specific permissions
		let commandPermissions: APIApplicationCommandPermission[] | undefined = perms.get(p_commandId);
		if (commandPermissions !== undefined) {
			havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED; // Default

			// Everyone/all channels
			let guildGlobalRolePermissions = commandPermissions.find((permission) => {
				return permission.id === this._everyone;
			});
			if (guildGlobalRolePermissions !== undefined) {
				if (guildGlobalRolePermissions.permission === true) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = 'This command is not allowed on this server.';
				}
			}
			let guildGlobalChannelPermissions = commandPermissions.find((permission) => {
				return permission.id === this._allchannels;
			});
			if (guildGlobalChannelPermissions !== undefined) {
				if (guildGlobalChannelPermissions.permission === true) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = 'This command is not allowed in any channel.';
				}
			}
			console.log('Command @everyone/#allChannels: ' + havePermissions);

			// Command specific based on roles
			let userRoles = p_user.roles.cache
				.filter((role, id) => {
					return id !== this._everyone && id !== this._allchannels;
				})
				.map((role) => role.id);
			let rolePermissions: APIApplicationCommandPermission[] | undefined = commandPermissions.filter(
				(permission) => {
					return userRoles.includes(permission.id);
				}
			);
			// Denied roles
			let deniedRole = rolePermissions.find((permission) => {
				return permission.permission === false;
			});
			if (deniedRole !== undefined) {
				havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
				havePermissionsMessage = `You are not allowed to use this command based on your roles. (<@&${deniedRole.id}>)`;
			}
			// Allowed roles
			if (
				rolePermissions.find((permission) => {
					return permission.permission === true;
				}) !== undefined
			) {
				havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
			}
			console.log('Command @roles: ' + havePermissions);

			let userPermissions = commandPermissions.find((permission) => {
				return permission.id === p_user.id;
			});
			if (userPermissions !== undefined) {
				if (userPermissions.permission === true) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = `You specifically are not allowed to use this command.`;
				}
			}
			console.log('Command @user: ' + havePermissions);

			// Permissions in this channel
			let channelPermissions = commandPermissions.find((permission) => {
				return permission.id === p_channel.id;
			});
			if (channelPermissions !== undefined) {
				if (channelPermissions.permission === true && havePermissions) {
					havePermissions = ApplicationCommandPermissionMap.TestResults.ALLOWED;
				} else {
					havePermissions = ApplicationCommandPermissionMap.TestResults.DENIED;
					havePermissionsMessage = `This command has been disabled for this channel by your administrator.`;
				}
			}
			console.log('Command #channel: ' + havePermissions);
		}
		return { ok: havePermissions, message: havePermissionsMessage };
	}
};

module.exports = ApplicationCommandPermissionMap;
