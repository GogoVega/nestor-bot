const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("site-fablab").setDescription("Liens du site fabLAB."),
	async execute(interaction) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Imprimante 3D")
					.setStyle(ButtonStyle.Link)
					.setURL("https://antodb.be/EPHEC/3D_printers.html")
			)
			.addComponents(
				new ButtonBuilder().setLabel("CNC").setStyle(ButtonStyle.Link).setURL("https://antodb.be/EPHEC/cnc.html")
			);
		await interaction.reply({
			content: "Site pour la gestion du fabLAB",
			components: [row],
			ephemeral: true,
		});
	},
};
