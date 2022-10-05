const express = require('express');
global.api = express();
global.http = require('node:http');
// global.https = require('node:https');
const PORT = global.settings.APIPort;

// const options = {
// 	pfx: fs.readFileSync('test/fixtures/test_cert.pfx'),
// 	passphrase: 'sample',
// };

global.api.use(express.json());
global.http.createServer(global.api).listen(PORT);
// global.https.createServer(options, global.api).listen(PORT);
// global.api.listen(PORT, () => global.logger.info('👂 The API server is listening on port ' + PORT));

let APIfiles: any[] = [];
global.fs.readdirSync('src/api').forEach((APIdir: any) => {
	global.logger.debug('API dir found: ' + APIdir);
	let dirPath = 'src/api/' + APIdir;
	let files = global.fs.readdirSync(dirPath).filter((file: string) => file.endsWith('.ts'));
	APIfiles[APIdir] = files;
});

// Initial loading of the API endpoints
for (const [dir, files] of Object.entries(APIfiles)) {
	files.forEach((file: string) => {
		global.logger.debug('Loading API from ' + dir + '/' + file);
		try {
			global.functions.requireIfExists('/api/' + dir + '/' + file);
		} catch (err) {
			global.logger.error('Error loading API from ' + dir + '/' + file, err);
		}
	});
}
