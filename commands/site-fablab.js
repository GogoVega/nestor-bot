const { MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('site-fablab')
		.setDescription('Liens du site fabLAB')
		.setDMPermission(false),
	async execute(interaction) {
		const row = new MessageActionRow()
			.addComponents(new MessageButton()
					.setLabel('Imprimante 3D')
					.setStyle('LINK')
					.setURL('https://antodb.be/EPHEC/3D_printers.html')
			)
			.addComponents(new MessageButton()
					.setLabel('CNC')
					.setStyle('LINK')
					.setURL('https://antodb.be/EPHEC/cnc.html')
			);
		await interaction.reply({ content: 'Site pour la gestion du fabLAB', components: [row] });
	},
};