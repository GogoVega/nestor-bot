const { createLogger, format, transports } = require("winston");
const { colorize, combine, printf, timestamp } = format;

const myFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
	level: "debug",
	exitOnError: false,
	format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), myFormat),
	transports: [
		new transports.Console({ format: combine(colorize(), myFormat) }),
		new transports.File({ filename: "data/nestor-bot.log", level: "info" }),
	],
});

module.exports = logger;
