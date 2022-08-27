import { Data, dataPaths, GuildEvent } from "../types/collection";
import logger from "../utils/logs/logger";
import { readFile, writeFile } from "../utils/readWriteFile";

// Delete Guild Data from Files
export const guildDelete: GuildEvent = {
	name: "guildDelete",
	async execute(guild, client) {
		try {
			if (!client) return;

			for (const [name, path] of Object.entries(dataPaths)) {
				const contentPath = `../../data/${path}`;
				const contentFile = (await readFile(contentPath)) as Data;

				client[name].delete(guild.id);
				delete contentFile[guild.id];

				await writeFile(contentPath, contentFile);
			}

			logger.info(`Server "${guild.name}": Successfully deleted guild data!`);
		} catch (error) {
			logger.error("Error when deleting guild data!", error);
		}
	},
};
