module.exports = {
	function: function (p_filePath: string) {
		let filepath = global.rootPath + p_filePath;
		global.logger.trace('Trying to fresh require file ' + filepath);
		// Remove from cache
		delete require.cache[require.resolve(filepath)];
		// Return file if it exists
		global.logger.trace('Checking existance of ' + filepath);
		if (global.fs.existsSync(filepath)) {
			global.logger.trace('Requiring ' + filepath);
			return require(filepath);
		} else {
			global.logger.trace('File does not exist: ' + filepath);
		}
		// Return undefined if file doesn't exist
		return undefined;
	},
};
