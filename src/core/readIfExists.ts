module.exports = {
	function: function (p_filePath: string) {
		let filepath = global.rootPath + p_filePath;
		global.logger.trace('Trying to fresh read file ' + filepath);
		// Return file if it exists
		if (global.fs.existsSync(filepath)) {
			global.logger.trace('File exists: ' + filepath);
			return global.fs.readFileSync(filepath, 'utf8');
		}
		// Return undefined if file doesn't exist
		global.logger.trace('File does not exist: ' + filepath);
		return undefined;
	},
};
