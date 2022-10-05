global.fs.existsSync('./logs/fatal.log') && global.fs.unlinkSync('./logs/fatal.log');
global.fs.existsSync('./logs/error.log') && global.fs.unlinkSync('./logs/error.log');
global.fs.existsSync('./logs/warn.log') && global.fs.unlinkSync('./logs/warn.log');
global.fs.existsSync('./logs/info.log') && global.fs.unlinkSync('./logs/info.log');
global.fs.existsSync('./logs/debug.log') && global.fs.unlinkSync('./logs/debug.log');
global.fs.existsSync('./logs/trace.log') && global.fs.unlinkSync('./logs/trace.log');
global.fs.existsSync('./logs/exception.log') && global.fs.unlinkSync('./logs/exception.log');
global.fs.existsSync('./logs/rejection.log') && global.fs.unlinkSync('./logs/rejection.log');

const { createLogger, format, transports, addColors } = require('winston');
global.logger = createLogger({
	levels: {
		fatal: 0,
		error: 1,
		warn: 2,
		info: 3,
		debug: 4,
		trace: 5,
	},
	format: format.combine(format.splat(), format.simple()),
	defaultMeta: {},
	transports: [
		new transports.File({
			filename: './logs/fatal.log',
			level: 'fatal',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.File({
			filename: './logs/error.log',
			level: 'error',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.File({
			filename: './logs/warn.log',
			level: 'warn',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.File({
			filename: './logs/info.log',
			level: 'info',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.File({
			filename: './logs/debug.log',
			level: 'debug',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.File({
			filename: './logs/trace.log',
			level: 'trace',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.Console({
			colorize: true,
			format: format.combine(format.colorize(), format.splat(), format.simple()),
			level: 'debug',
		}),
	],
	exceptionHandlers: [
		new transports.File({
			filename: './logs/exception.log',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.Console({
			colorize: true,
			format: format.combine(format.colorize()),
		}),
	],
	rejectionHandlers: [
		new transports.File({
			filename: './logs/rejection.log',
			format: format.combine(format.timestamp(), format.ms(), format.splat(), format.simple()),
		}),
		new transports.Console({
			colorize: true,
			format: format.combine(format.colorize()),
		}),
	],
	exitOnError: false,
});

addColors({
	fatal: 'bold underline black redBG',
	error: 'bold underline red',
	warn: 'bold yellow',
	info: 'magenta',
	debug: 'italic blue',
	trace: 'italic cyan',
});
