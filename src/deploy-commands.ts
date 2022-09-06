import { REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js";
import logger from "./utils/logs/logger";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { clientId, token } = require("../config.json");

import * as commandExports from "./commands";

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

Object.values(commandExports).forEach((command) => commands.push(command.data.toJSON()));

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
	try {
		logger.info("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationCommands(clientId), { body: commands });

		logger.info("Successfully reloaded application (/) commands.");
	} catch (error) {
		logger.error(error);
	}
})();
