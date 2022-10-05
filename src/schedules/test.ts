function testMessage() {
	global.bot.channels.cache.get('1022906593400078449').send('test');
}

setInterval(testMessage, 1000 * 10);
