import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import process from "node:process";
import { Command } from "../types/collection";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getCpuUsage = require("cpu-percentage");

export const processCommand: Command = {
	data: new SlashCommandBuilder().setName("process-infos").setDescription("Replies with process infos."),
	async execute(interaction, client) {
		const start = getCpuUsage();
		const guildsCount = {
			name: "Nombre totale de guilds",
			value: `Le serveur contient \`${(await client.guilds.fetch()).size}\` guilds.`,
		};
		const ping = { name: "Ping du serveur", value: `Le ping est de \`${client.ws.ping}\` ms.` };
		const cpuUsage = {
			name: "Utilisation du processeur (CPU)",
			value: `Le CPU est utilisé à \`${getCpuUsage(start).percent}\` %`,
		};
		const memoryObject = Object.entries(process.memoryUsage()).map(
			([key, value]) => `\n• **${key}** => \`${value / 1000000}\` MB`
		);
		const memoryUsage = {
			name: "Utilisation de la mémoire (GPU)",
			value: `Mémoire utilisée pour : ${memoryObject.toString().replace(/,/gm, "")}`,
		};

		const templateEmbed = new EmbedBuilder()
			.setColor(Colors.DarkerGrey)
			.setTitle("Etat du processus")
			.addFields([guildsCount, ping, cpuUsage, memoryUsage])
			.setTimestamp()
			.setFooter({
				text: `${interaction.guild?.members.me?.displayName} • FabLAB`,
				iconURL: client.user?.displayAvatarURL(),
			});

		await interaction.reply({ embeds: [templateEmbed], ephemeral: true });
	},
};
