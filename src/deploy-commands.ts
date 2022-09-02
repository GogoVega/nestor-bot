import { REST } from "@discordjs/rest";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import logger from "./utils/logs/logger";
import path from "path";
import fs from "fs";

const configPath = path.join(__dirname, "../config.json");
const { clientId, token } = JSON.parse(fs.readFileSync(configPath, { encoding: "utf-8" }));

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
