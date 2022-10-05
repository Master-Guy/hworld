const Database = global.functions.requireIfExists('/classes/database.ts');

declare global {
	var bot: any;
	var rootPath: string;
	var functions: any;
	var chatInputCommandInteractions: Array;
	var buttonInteractions: Array;
	var commands: any;
	var buttonCommands: any;
	var queue: any;
	var fs: any;
	var http: any;
	var https: any;
	var sleep: Function;
	var logger: any;
	var runningPath: string;
	var errorcodes: any;
	var settingsFile: string;
	var settings: JSONData;
	var registeredPublicCommands: boolean;
	var registeredPrivateCommands: boolean;
	var registerRequiredCommands: Function;
	var registerCommands: Function;
	var CommandTypes: object;
	var api: any;
	var registeredSlashCommandInteractions: Array<any>;
	var registeredSlashCommandInteractionsPublic: Array<any>;
	var registeredSlashCommandInteractionsPrivate: Array<any>;
	var acpMaps: Map<string, Map<string, Array<ApplicationCommandPermissionType>>>;
	var database: Database;
	var parseMessageAttachments: any;
}
export default global;
