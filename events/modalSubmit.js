const { MessageEmbed } = require("discord.js");

// Modal Submission for command-fablab description command
module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isModalSubmit()) return;

		if (interaction.customId !== "description") return;

		try {
			const channelId = interaction.fields.getTextInputValue("channelIdInput");
			const messageId = interaction.fields.getTextInputValue("messageIdInput");
			const descriptionInput = interaction.fields.getTextInputValue("descriptionInput");

			if (!descriptionInput || !channelId || !messageId)
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
		} catch (error) {
			console.error("Error during Modal Submission!", error);
			return await interaction.reply({
				content: ":x: | ID du message incorrect ou élément manquant!\nVeuillez réessayer SVP.",
				ephemeral: true,
			});
		}
	},
};
