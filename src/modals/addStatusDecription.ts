import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Modals } from "../types/collection";

// Modal Submission for command-fablab description command
export const description: Modals = {
	data: new ModalBuilder()
		.setCustomId("description")
		.setTitle("Ajout d'une description")
		.addComponents([
			new ActionRowBuilder<TextInputBuilder>().addComponents([
				new TextInputBuilder()
					.setCustomId("descriptionInput")
					.setLabel("Description à ajouter")
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(true),
			]),
		]),
	async execute(interaction, client) {
		const descriptionInput = interaction.fields.getTextInputValue("descriptionInput");

		if (!this.channelId || !descriptionInput || !this.messageId)
			throw new Error("Missing message ID, channel ID or description!");

		const channel = await client.channels.fetch(this.channelId);

		if (!channel?.isTextBased()) return;

		const message = await channel.messages.fetch(this.messageId);
		const receivedEmbed = message.embeds[0];
		const exampleEmbed = EmbedBuilder.from(receivedEmbed)
			.setTimestamp(new Date())
			.addFields([{ name: "Description", value: `${descriptionInput}\n\u200b` }]);

		await message.edit({ embeds: [exampleEmbed] });
		return await interaction.reply({
			content: `:white_check_mark: | Description ajoutée !\n\`\`\`${descriptionInput}\`\`\``,
			ephemeral: true,
		});
	},
};
