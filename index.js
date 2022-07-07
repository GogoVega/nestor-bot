const { Client, Collection, Intents, MessageActionRow } = require("discord.js");
const { token } = require("./config.json");
const path = require("path");
const fs = require("fs");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Reading commands from files
// @ts-ignore
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// @ts-ignore
	client.commands.set(command.data.name, command);
}

// Reading buttons from files
// @ts-ignore
client.buttons = new Collection();
const buttonsPath = path.join(__dirname, "buttons");
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith(".js"));

for (const file of buttonFiles) {
	const filePath = path.join(buttonsPath, file);
	const button = require(filePath);

	// @ts-ignore
	client.buttons.set(button.data.customId, button);
}

// Sort buttons by indice
const msgActionRow = new MessageActionRow();
// @ts-ignore
[...client.buttons.values()]
	.sort((A, B) => A.indice - B.indice)
	.forEach((button) => msgActionRow.addComponents(button.data));

// @ts-ignore
client.messageAction = new Collection();
// @ts-ignore
client.messageAction.set("messageActionButton", msgActionRow);

// Events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, async (...args) => await event.execute(...args));
	} else {
		client.on(event.name, async (...args) => await event.execute(...args, client));
	}
}

client.login(token);
