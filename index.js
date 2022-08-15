const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { token } = require("./config.json");
const path = require("path");
const fs = require("fs");

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

// Create Collections for Buttons, Commands and Modals.
const { createInteractionCollections } = require("./utils/createCollections.js");
createInteractionCollections(client);

// Create Message Action (Buttons) for messageCreate interaction
const { createMessageAction } = require("./utils/createMessageAction.js");
createMessageAction(client);

// Create Collections for data folder.
const { createDataCollections } = require("./utils/createCollections.js");
createDataCollections(client);

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
