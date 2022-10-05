global.functions['bot__writeSettingsFile'] = function () {
	global.fs.writeFileSync(global.settingsFile, JSON.stringify(global.settings, null, '\t'));
};

global.functions['bot__readSettingsFile'] = function () {
	if (global.fs.existsSync(global.settingsFile)) {
		require('dotenv').config();
		global.settings = JSON.parse(global.fs.readFileSync(global.settingsFile));
	} else {
		global.settings = JSON.parse('{}');
		global.functions['bot__writeSettingsFile']();
	}
};
