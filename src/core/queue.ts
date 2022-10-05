let JSONbig: any;
if (global.settings.DevelopmentOverrides === true) {
	JSONbig = require('json-bigint');
}

let wrapDelayedFunction = function (p_function: Function, p_arguments: Array<any>) {
	return async function () {
		p_function.apply(undefined, p_arguments);
	};
};

global.queue.messageCycles = Math.ceil(1000 / global.settings.QueueInterval);

global.queue.addLongCall = function (p_cycles: number, p_function: Function, p_arguments: Array<any>) {
	global.queue.addCall(p_function, p_arguments);
	for (let i = 1; i < p_cycles; i++) {
		global.queue.addCall(async () => {}, []);
	}
};

global.queue.addCall = function (p_function: Function, p_arguments: Array<any>) {
	if (p_function.constructor.name !== 'AsyncFunction') {
		global.logger.error(`Cannot add delayed function call ${p_function.name}: Not an async function`);
		return false;
	}
	if (!Array.isArray(p_arguments)) {
		global.logger.error(
			`Cannot add delayed function call ${p_function.name}: Argument is not an array, but ${typeof p_arguments}`
		);
		return false;
	}
	if (global.settings.DevelopmentOverrides === true) {
		global.logger.trace(
			`Registered delayed function call ${p_function.name} with parameter(s): ${JSONbig.stringify(p_arguments)}`
		);
	}
	global.queue.delayedCalls.push(wrapDelayedFunction(p_function, p_arguments));
	return true;
};

global.queue.makeCall = function () {
	if (global.queue.delayedCalls.length > 0) {
		global.logger.trace(`Making delayed call from queue. Current length: ${global.queue.delayedCalls.length}`);
		global.queue.delayedCalls.shift()();
	}
};

global.queue.getETRSeconds = function () {
	let int_queueLength = global.queue.delayedCalls.length;
	let int_seconds = Math.ceil(int_queueLength / (1000 / global.settings.QueueInterval));
	return int_seconds;
};

global.queue.getETR = function (p_duration = -Infinity) {
	let int_seconds;
	if (p_duration === -Infinity) {
		int_seconds = global.queue.getETRSeconds();
	} else {
		int_seconds = p_duration;
	}
	if (int_seconds < 5) {
		return `a couple of moments`;
	}
	if (int_seconds < 60) {
		return `about ${int_seconds} seconds`;
	}
	let int_minutes = Math.floor(int_seconds / 60);
	int_seconds %= 60;
	if (int_minutes < 5) {
		return `about ${int_minutes} minutes and ${int_seconds} seconds`;
	}
	if (int_minutes < 60) {
		return `about ${int_minutes} minutes`;
	}
	if (int_minutes > 180) {
		setTimeout(() => {
			global.bot.stopBot(global.errorcodes.REQ_RESTART);
		}, 1000);
		return `either way too long, or something is wrong with the bot. Doing a quick reboot of the bot now!`;
	}
	return `more then an hour. You might want to contact <@${global.settings.BotOwner}> about this to check the bot.`;
};

setInterval(global.queue.makeCall, global.settings.QueueInterval);
