import { REST } from "@discordjs/rest";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { clientId, token } from "../config.json";
import logger from "./utils/logs/logger";

import * as commandExports from "./commands";

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

Object.values(commandExports).forEach((command) => commands.push(command.data.toJSON()));

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationCommands(clientId), { body: commands });

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		logger.error(error);
	}
})();
