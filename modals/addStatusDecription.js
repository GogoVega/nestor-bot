const { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

// Modal Submission for command-fablab description command
module.exports = {
	channelId: "",
	messageId: "",
	data: new ModalBuilder()
		.setCustomId("description")
		.setTitle("Ajout d'une description")
		// @ts-ignore
		.addComponents([
			new ActionRowBuilder().addComponents([
				new TextInputBuilder()
					.setCustomId("descriptionInput")
					.setLabel("Description à ajouter")
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(true),
			]),
		]),
	async execute(interaction, client) {
		const descriptionInput = interaction.fields.getTextInputValue("descriptionInput");
		const modal = client.modals.get("description");
		const channelId = modal?.channelId;
		const messageId = modal?.messageId;

		if (!channelId || !descriptionInput || !messageId)
			throw new Error("Missing message ID, channel ID or description!");

		const channel = await client.channels.fetch(channelId);
		const message = await channel.messages.fetch(messageId);
		const receivedEmbed = message.embeds[0];
		const exampleEmbed = EmbedBuilder.from(receivedEmbed);

		exampleEmbed.addFields([{ name: "Description", value: `${descriptionInput}\n\u200b` }]);

		await message.edit({ embeds: [exampleEmbed] });
		return await interaction.reply({
			content: `:white_check_mark: | Description ajoutée !\n\`\`\`${descriptionInput}\`\`\``,
			ephemeral: true,
		});
	},
};
