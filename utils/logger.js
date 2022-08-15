const { createLogger, format, transports } = require("winston");
const { colorize, combine, simple, timestamp } = format;

const logger = createLogger({
	exitOnError: false,
	format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), simple()),
	transports: [
		new transports.Console({ format: combine(colorize(), simple()) }),
		new transports.File({ filename: "data/nestor-bot.log", level: "info" }),
	],
});

module.exports = logger;
