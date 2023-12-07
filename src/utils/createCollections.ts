import { Collection, mergeDefault } from "discord.js";
import { MyClient } from "../types/client";
import { Configuration, Data, dataPaths, defaultConfigurations, Entry, Reaction } from "../types/collection";
import path from "path";
import fs from "fs";

const defaultData = {
	configurations: defaultConfigurations,
	reactions: {},
};

// Reading data from files
function createDataCollections(client: MyClient) {
	for (const [collectionName, dataPath] of Object.entries(dataPaths)) {
		const contentPath = path.join(__dirname, "..", "..", `/data/${dataPath}`);
		const contentFile: Data = JSON.parse(fs.readFileSync(contentPath, { encoding: "utf-8" }));

		const content = Object.entries(contentFile) as Entry<Configuration | Reaction>[];

		content.forEach(([guilId, guildContent]) => {
			contentFile[guilId] = mergeDefault(defaultData[collectionName as keyof typeof defaultData], guildContent) as
				| Configuration
				| Reaction;
		});

		client[collectionName] = new Collection();
		Object.keys(contentFile).forEach((guildId) => client[collectionName].set(guildId, contentFile[guildId]));
	}
}

import * as buttonExports from "../buttons";
import * as commandExports from "../commands";
import * as modalExports from "../modals";

const interactionExports = {
	buttons: buttonExports,
	commands: commandExports,
	modals: modalExports,
};

// Reading interactions from files
function createInteractionCollections(client: MyClient) {
	for (const [name, exports] of Object.entries(interactionExports)) {
		client[name] = new Collection();
		for (const interaction of Object.values(exports)) {
			const interactionName = interaction.data.toJSON()?.custom_id || interaction.data.name;
			client[name].set(interactionName, interaction);
		}
	}
}

export { createDataCollections, createInteractionCollections };
