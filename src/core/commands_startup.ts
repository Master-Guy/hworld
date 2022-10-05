global.registeredPublicCommands = false;
global.registeredPrivateCommands = false;

let files = global.fs.readdirSync('src/commands').filter((file: string) => file.endsWith('.ts'));
global.logger.trace('Command files found:');
global.logger.trace(files);

for (const file of files) {
	global.logger.trace('Loading command from ' + file);
	try {
		global.functions.requireIfExists('/commands/' + file);
	} catch (err) {
		global.logger.error('Error loading command from ' + file, err);
	}
}

global.registerRequiredCommands();
