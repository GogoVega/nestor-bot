const { MessageActionRow, MessageEmbed, Modal, TextInputComponent } = require("discord.js");

// Modal Submission for command-fablab description command
module.exports = {
	channelId: "",
	messageId: "",
	data: new Modal()
		.setCustomId("description")
		.setTitle("Ajout d'une description")
		.addComponents(
			// @ts-ignore
			new MessageActionRow().addComponents(
				// @ts-ignore
				new TextInputComponent()
					.setCustomId("descriptionInput")
					.setLabel("Description à ajouter")
					.setStyle("PARAGRAPH")
					.setRequired(true)
			)
		),
	async execute(interaction, client) {
		const descriptionInput = interaction.fields.getTextInputValue("descriptionInput");
		const modal = client.modals.get("description");
		const channelId = modal?.channelId;
		const messageId = modal?.messageId;

		if (!channelId || !descriptionInput || !messageId)
			throw new Error("Missing message ID, channel ID or description!");

		const channel = await client.channels.fetch(channelId);
		const message = await channel.messages.fetch(messageId);
		const exampleEmbed = new MessageEmbed(message.embeds[0]);

		exampleEmbed.addField("Description", `${descriptionInput}\n\u200b`);

		await message.edit({ embeds: [exampleEmbed] });
		return await interaction.reply({
			content: `:white_check_mark: | Description ajoutée !\n\`\`\`${descriptionInput}\`\`\``,
			ephemeral: true,
		});
	},
};
