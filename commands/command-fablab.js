const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("commande-fablab")
		.setDescription("Ajouter une description ainsi que le temps d'impression.")

		.addSubcommand((subcommand) =>
			subcommand
				.setName("description")
				.setDescription("Ajouter une description au statut de la commande.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon contenant le message.").setRequired(true)
				)
				.addStringOption((option) =>
					option.setName("message_id").setDescription("ID du message contenant le statut.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("temps_impression")
				.setDescription("Ajouter le temps restant d'impression.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon contenant le message.").setRequired(true)
				)
				.addStringOption((option) =>
					option.setName("message_id").setDescription("ID du message contenant le statut.").setRequired(true)
				)
				.addIntegerOption((option) =>
					option.setName("heures").setDescription("Heures restantes.").setRequired(true).setMinValue(0).setMaxValue(72)
				)
				.addIntegerOption((option) =>
					option
						.setName("minutes")
						.setDescription("Minutes restantes.")
						.setRequired(true)
						.setMinValue(0)
						.setMaxValue(59)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("fin_impression")
				.setDescription("Ajouter le temps d'impression réelle et une image (en option).")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon contenant le message.").setRequired(true)
				)
				.addStringOption((option) =>
					option.setName("message_id").setDescription("ID du message contenant le statut.").setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName("heures")
						.setDescription("Heures d'impression.")
						.setRequired(true)
						.setMinValue(0)
						.setMaxValue(72)
				)
				.addIntegerOption((option) =>
					option
						.setName("minutes")
						.setDescription("Minutes d'impression.")
						.setRequired(true)
						.setMinValue(0)
						.setMaxValue(59)
				)
				.addAttachmentOption((option) => option.setName("image").setDescription("Glissez l'image.").setRequired(false))
		),
	async execute(interaction, client) {
		try {
			const subcommandName = interaction.options.getSubcommand();
			const channelId = interaction.options.getChannel("salon_id")?.id;
			const msgId = interaction.options.getString("message_id");

			const channel = await client.channels.fetch(channelId);
			const message = await channel.messages.fetch(msgId);
			const receivedEmbed = message.embeds[0];
			const exampleEmbed = EmbedBuilder.from(receivedEmbed).setTimestamp(new Date());
			const fields = receivedEmbed.fields;

			const timeHours = interaction.options.getInteger("heures");
			const timeMins = interaction.options.getInteger("minutes");

			switch (subcommandName) {
				case "description": {
					if (exampleEmbed.data.title !== "Statut de votre commande")
						return await interaction.reply({
							content: "Erreur: Vous ne pouvez pas modifier ce message !",
							ephemeral: true,
						});

					const modal = client.modals.get("description");

					modal.channelId = channelId;
					modal.messageId = msgId;

					client.modals.set("description", modal);
					return await interaction.showModal(modal.data);
				}
				case "temps_impression": {
					if (!fields.some((field) => field.name === "Impression" || field.name === "Réimpression"))
						return await interaction.reply({
							content: ":x: | Aucune impression en cours !",
							ephemeral: true,
						});

					if (fields.some((field) => field.name === "Fini"))
						return await interaction.reply({
							content: ":x: | L'impression est terminé !",
							ephemeral: true,
						});

					const date_finish = new Date();
					date_finish.setHours(date_finish.getHours() + timeHours);
					date_finish.setMinutes(date_finish.getMinutes() + timeMins);

					exampleEmbed.addFields([
						{
							name: "Temps restant d'impression",
							value: `Le temps d'impression estimé est de ${timeHours}h ${timeMins}min.\nCe qui vous donne RDV pour ${date_finish.getHours()}h ${date_finish.getMinutes()}.\n\u200b`,
						},
					]);
					await message.edit({ embeds: [exampleEmbed] });
					return await interaction.reply({
						content: `:white_check_mark: | Temps restant \`${timeHours}h ${timeMins}min\` ajoutée !`,
						ephemeral: true,
					});
				}
				case "fin_impression": {
					if (!fields.some((field) => field.name === "Impression" || field.name === "Réimpression"))
						return await interaction.reply({
							content: ":x: | Aucune impression en cours !",
							ephemeral: true,
						});

					exampleEmbed.addFields([
						{
							name: "Temps d'impression",
							value: `L'impression a été effectuée en ${timeHours}h ${timeMins}min.\n\u200b`,
						},
					]);

					const image = interaction.options.getAttachment("image");
					if (image) exampleEmbed.setImage(image.url);

					await message.edit({ embeds: [exampleEmbed] });
					return await interaction.reply({
						content: ":white_check_mark: | Message de fin d'impression ajoutée !",
						ephemeral: true,
					});
				}
			}
			console.log("Message edited unsuccessfully!");
		} catch (error) {
			console.error("Error during command-fablab command!", error);
			return await interaction.reply({
				content: ":x: | ID du message incorrect !",
				ephemeral: true,
			});
		}
	},
};
