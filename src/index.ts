import { Client, GatewayIntentBits, Partials } from "discord.js";
import { MyClient } from "./types/client";
import { initTranslation } from "./utils/translation";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token } = require("../config.json");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Channel, Partials.Message, Partials.Reaction],
}) as MyClient;

//
initTranslation();

// Create Collections for Buttons, Commands and Modals.
import { createInteractionCollections } from "./utils/createCollections";
createInteractionCollections(client);

// Create Message Action (Buttons) for messageCreate interaction
import { createMessageAction } from "./utils/createMessageAction";
createMessageAction(client);

// Create Collections for data folder.
import { createDataCollections } from "./utils/createCollections";
createDataCollections(client);

// Events
import * as eventExports from "./events";

for (const event of Object.values(eventExports)) {
	if (event.once) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		client.once(event.name, async (...args) => await event.execute(...args));
	} else {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		client.on(event.name, async (...args) => await event.execute(...args, client));
	}
}

client.login(token);
