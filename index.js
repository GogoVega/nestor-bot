const { ActionRowBuilder, Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const { token } = require("./config.json");
const path = require("path");
const fs = require("fs");

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

const foldersName = ["commands", "buttons", "modals"];

for (const folderName of foldersName) {
	client[folderName] = new Collection();
	const folderPath = path.join(__dirname, folderName);
	const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const content = require(filePath);

		if (folderName === "commands") {
			client[folderName].set(content.data.name, content);
		} else {
			client[folderName].set(content.data.toJSON()?.custom_id, content);
		}
	}
}

// Sort buttons by indice
const msgActionRow = new ActionRowBuilder();
// @ts-ignore
[...client.buttons.values()]
	.sort((A, B) => A.indice - B.indice)
	.forEach((button) => msgActionRow.addComponents(button.data));

// @ts-ignore
client.messageAction = new Collection();
// @ts-ignore
client.messageAction.set("messageActionButton", msgActionRow);

// Reading reactions from file
// @ts-ignore
client.reactions = new Collection();
const reactionsPath = path.join(__dirname, "./data/reactions.json");
const reactionsFile = JSON.parse(fs.readFileSync(reactionsPath, { encoding: "utf-8" }));

// @ts-ignore
Object.keys(reactionsFile).forEach((msgId) => client.reactions.set(msgId, reactionsFile[msgId]));

// Reading authorized channels from file
// @ts-ignore
client.authorizedChannels = new Collection();
const channelsPath = path.join(__dirname, "./data/channels.json");
// @ts-ignore
client.authorizedChannels = JSON.parse(fs.readFileSync(channelsPath, { encoding: "utf-8" }));

// Reading logs configuration parameters from file
// @ts-ignore
client.logsConfiguration = new Collection();
const logsConfigurationPath = path.join(__dirname, "./data/logsConfiguration.json");
// @ts-ignore
client.logsConfiguration = JSON.parse(fs.readFileSync(logsConfigurationPath, { encoding: "utf-8" }));

// Events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

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
