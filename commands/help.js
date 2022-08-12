const { SlashCommandBuilder } = require("@discordjs/builders");
const { Colors, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Replies with all available commands and their usage."),
	async execute(interaction, client) {
		const templateEmbed = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle("Available Commands")
			.addFields(client.commands.map((cmd) => ({ name: cmd.data.name, value: cmd.data.description })))
			.setTimestamp()
			.setFooter({ text: `${interaction.guild.members.me.nickname} • FabLAB`, iconURL: client.user.avatarURL() });

		return await interaction.reply({ embeds: [templateEmbed], ephemeral: true });
	},
};
