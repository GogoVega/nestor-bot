import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/collection";
import process from "node:process";

function secNSec2ms(secNSec: number | [number, number]) {
	if (Array.isArray(secNSec)) {
		return secNSec[0] * 1000 + secNSec[1] / 1000000;
	}
	return secNSec / 1000;
}
// TODO: Not sure it works!
function getCpuUsage() {
	const startTime = process.hrtime();
	const startUsage = process.cpuUsage();

	const elapTime = process.hrtime(startTime);
	const elapUsage = process.cpuUsage(startUsage);

	const elapTimeMS = secNSec2ms(elapTime);
	const elapUserMS = secNSec2ms(elapUsage.user);
	const elapSystMS = secNSec2ms(elapUsage.system);

	return Math.round((100 * (elapUserMS + elapSystMS)) / elapTimeMS);
}

export const processCommand: Command = {
	data: new SlashCommandBuilder().setName("process-infos").setDescription("Replies with process infos."),
	async execute(interaction, client) {
		const guildsCount = {
			name: "Nombre totale de guilds",
			value: `Le serveur contient \`${(await client.guilds.fetch()).size}\` guilds.`,
		};
		const ping = { name: "Ping du serveur", value: `Le ping est de \`${client.ws.ping}\` ms.` };
		const cpuUsage = { name: "Utilisation du processeur (CPU)", value: `Le CPU est utilisé à \`${getCpuUsage()}\` %` };
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

		return await interaction.reply({ embeds: [templateEmbed], ephemeral: true });
	},
};
