const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { channelId } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("commande-fablab")
		.setDescription("Ajouter une description ainsi que le temps d'impression.")

		.addSubcommand((subcommand) => subcommand
			.setName("description")
			.setDescription("Ajouter une description au statut de la commande.")
			.addStringOption((option) => option
				.setName("message_id")
				.setDescription("ID du message contenant le statut.")
				.setRequired(true)
			)
			.addStringOption((option) => option
				.setName("description")
				.setDescription("Description à insérer.")
				.setRequired(true)
			)
		)
		.addSubcommand((subcommand) => subcommand
			.setName("temps_impression")
			.setDescription("Ajouter le temps restant d'impression.")
			.addStringOption((option) => option
				.setName("message_id")
				.setDescription("ID du message contenant le statut.")
				.setRequired(true)
			)
			.addIntegerOption((option) => option
				.setName("heures")
				.setDescription("Heures restantes.")
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(72)
			)
			.addIntegerOption((option) => option
				.setName("minutes")
				.setDescription("Minutes restantes.")
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(59)
			)
		)
		.addSubcommand((subcommand) => subcommand
			.setName("fin_impression")
			.setDescription("Ajouter le temps d'impression réelle et une image (en option).")
			.addStringOption((option) => option
				.setName("message_id")
				.setDescription("ID du message contenant le statut.")
				.setRequired(true)
			)
			.addIntegerOption((option) => option
				.setName("heures")
				.setDescription("Heures d'impression.")
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(72)
			)
			.addIntegerOption((option) => option
				.setName("minutes")
				.setDescription("Minutes d'impression.")
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(59)
			)
			.addAttachmentOption((option) => option
				.setName("image")
				.setDescription("Glissez l'image.")
				.setRequired(false)
			)
		),
	async execute(interaction, client) {
		const subcommandName = interaction.options.getSubcommand();
		const msgId = interaction.options.getString("message_id");

		const description = interaction.options.getString("description");
		const timeHours = interaction.options.getInteger("heures");
		const timeMins = interaction.options.getInteger("minutes");
		const date_finish = new Date();
		//const image = interaction.options.getAttachment("image");

		try {
			const message = await client.channels.cache.get(channelId).messages.fetch(msgId);
			const receivedEmbed = message.embeds[0];
			const exampleEmbed = new MessageEmbed(receivedEmbed);
			const fields = receivedEmbed.fields;

			switch (subcommandName) {
				case "description":
					exampleEmbed.addField("Description", `${description}\n\u200b`);
					await message.edit({ embeds: [exampleEmbed] });
					return await interaction.reply({ content: `:white_check_mark: | Description ajoutée !\n\`\`\`${description}\`\`\``, ephemeral: true });
				case "temps_impression":
					if (!fields.some((field) => field.name === "Impression" || field.name === "Réimpression"))
						return await interaction.reply({ content: `:x: | Aucune impression en cours !`, ephemeral: true });

					if (fields.some((field) => field.name === "Fini"))
						return await interaction.reply({ content: `:x: | L'impression est terminé !`, ephemeral: true });

					exampleEmbed.addField("Temps restant d'impression", `Le temps d'impression estimé est de ${timeHours}h ${timeMins}min.\nCe qui vous donne RDV pour ${date_finish.getHours() + timeHours}h ${date_finish.getMinutes() + timeMins}.\n\u200b`);
					await message.edit({ embeds: [exampleEmbed] });
					return await interaction.reply({ content: `:white_check_mark: | Temps restant \`${timeHours}h ${timeMins}min\` ajoutée !`, ephemeral: true });
				case "fin_impression":
					if (!fields.some((field) => field.name === "Impression" || field.name === "Réimpression"))
						return await interaction.reply({ content: `:x: | Aucune impression en cours !`, ephemeral: true });

					exampleEmbed.addField("Temps d'impression", `L'impression a été effectuée en ${timeHours}h ${timeMins}min.\n\u200b`);

					//const file = new MessageAttachment(image);

					//await message.edit({ embeds: [exampleEmbed], files: [file] });
					await message.edit({ embeds: [exampleEmbed] });
					return await interaction.reply({ content: `:white_check_mark: | Message de fin d'impression ajoutée !`, ephemeral: true });
			}
			console.log("Message edited successfully.");
		} catch (error) {
			console.error(error);
			return await interaction.reply({ content: ":x: | ID du message incorrect !", ephemeral: true });
		}
	},
};