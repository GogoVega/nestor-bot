const path = require("path");
const fs = require("fs");

// Delete Guild Data from Files
module.exports = {
	name: "guildDelete",
	execute(guild, client) {
		const dataPaths = {
			reactions: "reactions.json",
			authorizedChannels: "channels.json",
			logsConfiguration: "logsConfiguration.json",
		};

		try {
			for (const dataPath of Object.keys(dataPaths)) {
				const contentPath = path.join(__dirname, `../data/${dataPaths[dataPath]}`);
				const contentFile = JSON.parse(fs.readFileSync(contentPath, { encoding: "utf-8" }));

				client[dataPath].delete(guild.id);
				delete contentFile[guild.id];

				fs.writeFile(contentPath, JSON.stringify(contentFile), { encoding: "utf-8", flag: "w" }, (error) => {
					if (error) {
						if (error.code != "EEXIST") throw error;
					}
				});
			}

			console.log(`Server "${guild.name}": Successfully deleted guild data!`);
		} catch (error) {
			console.error("Error when deleting guild data!", error);
		}
	},
};
