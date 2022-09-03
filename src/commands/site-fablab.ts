import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/collection";

export const siteFablab: Command = {
	data: new SlashCommandBuilder().setName("site-fablab").setDescription("Liens du site fabLAB."),
	async execute(interaction) {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Imprimante 3D")
					.setStyle(ButtonStyle.Link)
					.setURL("https://nestor-pages.herokuapp.com/3D_printers.html")
			)
			.addComponents(
				new ButtonBuilder()
					.setLabel("CNC")
					.setStyle(ButtonStyle.Link)
					.setURL("https://nestor-pages.herokuapp.com/cnc.html")
			);
		await interaction.reply({
			content: "Site pour la gestion du fabLAB",
			components: [row],
			ephemeral: true,
		});
	},
};
