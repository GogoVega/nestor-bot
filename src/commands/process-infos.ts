import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";
import process from "node:process";
import { Command } from "../types/collection";
import { loadTranslations } from "../utils/translation";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getCpuUsage = require("cpu-percentage");

export const processCommand: Command = {
	data: new SlashCommandBuilder()
		.setName(i18next.t("command.process.build.name"))
		.setNameLocalizations(loadTranslations("command.process.build.name"))
		.setDescription(i18next.t("command.process.build.description"))
		.setDescriptionLocalizations(loadTranslations("command.process.build.description")),
	async execute(interaction, client) {
		const start = getCpuUsage();
		const guildsCount = {
			name: "Total Number of Guilds",
			value: `The server contains \`${(await client.guilds.fetch()).size}\` guilds.`,
		};
		const ping = { name: "Server ping", value: `The ping is \`${client.ws.ping}\` ms.` };
		const cpuUsage = {
			name: "Processor (CPU) usage",
			value: `The CPU is used at \`${getCpuUsage(start).percent}\` %`,
		};
		const memoryObject = Object.entries(process.memoryUsage()).map(
			([key, value]) => `\n• **${key}** => \`${value / 1000000}\` MB`
		);
		const memoryUsage = {
			name: "Memory usage (GPU)",
			value: `Memory used for : ${memoryObject.toString().replace(/,/gm, "")}`,
		};

		const templateEmbed = new EmbedBuilder()
			.setColor(Colors.DarkerGrey)
			.setTitle("Process Status")
			.addFields([guildsCount, ping, cpuUsage, memoryUsage])
			.setTimestamp()
			.setFooter({
				text: interaction.guild?.members.me?.displayName ?? "Nestor",
				iconURL: client.user?.displayAvatarURL(),
			});

		await interaction.reply({ embeds: [templateEmbed], ephemeral: true });
	},
};
