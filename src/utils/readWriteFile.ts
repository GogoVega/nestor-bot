import { mergeDefault } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { Configuration, ConfigurationsFile, Data, defaultConfigurations } from "../types/collection";

const configurationsPath = "../../data/configurations.json";

// Create path
function createPath(filePath: string) {
	return path.join(__dirname, filePath);
}

// Read file
async function readFile(filePath: string): Promise<Record<string, unknown>> {
	return JSON.parse(await fs.readFile(createPath(filePath), { encoding: "utf-8" }));
}

// Write file
function writeFile(filePath: string, fileContent: Data): Promise<void> {
	return fs.writeFile(createPath(filePath), JSON.stringify(fileContent), { encoding: "utf-8", flag: "w" });
}

async function readConfigurationsFile(guildId: string): Promise<ConfigurationsFile> {
	const configurationsFile = (await readFile(configurationsPath)) as ConfigurationsFile;

	configurationsFile[guildId] = mergeDefault(defaultConfigurations, configurationsFile[guildId]) as Configuration;

	return configurationsFile;
}

function writeConfigurationsFile(fileContent: ConfigurationsFile): Promise<void> {
	return fs.writeFile(createPath(configurationsPath), JSON.stringify(fileContent), { encoding: "utf-8", flag: "w" });
}

export { readFile, readConfigurationsFile, writeFile, writeConfigurationsFile };
