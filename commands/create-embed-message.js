const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("create-embed-message")
		.setDescription("Creation d'un message au format Embed.")
		.addChannelOption((option) =>
			option
				.setName("salon_id")
				.setDescription("ID du salon dans lequel vous souhaitez publiez ce message.")
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option.setName("timestamp").setDescription("Souhaitez-vous ajouter la date à votre message ?")
		)
		.addStringOption((option) =>
			option.setName("color").setDescription("Souhaitez-vous ajouter une couleur à votre message ?")
		)
		.addStringOption((option) =>
			option.setName("author").setDescription("Souhaitez-vous ajouter l'auteur de votre message ? (par défaut: Bot)")
		)
		.addStringOption((option) =>
			option.setName("icon-url").setDescription("Souhaitez-vous ajouter une icon à votre message ? (par défaut: Bot)")
		)
		.addAttachmentOption((option) => option.setName("icon-image").setDescription("Veuillez glissez l'image de l'icon."))
		.addAttachmentOption((option) =>
			option.setName("miniature").setDescription("Veuillez glissez l'image de la miniature.")
		)
		.addAttachmentOption((option) => option.setName("image").setDescription("Veuillez glissez l'image.")),
	async execute(interaction, client) {
		const modal = client.modals.get("createEmbedMessage");
		modal.channelId = interaction.options.getChannel("salon_id")?.id;

		modal.author = interaction.options.getString("author");
		modal.color = interaction.options.getString("color");
		modal.timestamp = interaction.options.getBoolean("timestamp");

		modal.image = interaction.options.getAttachment("image");
		modal.iconURL = interaction.options.getString("icon-url");
		modal.iconImage = interaction.options.getAttachment("icon-image");
		modal.thumbnail = interaction.options.getAttachment("miniature");

		client.modals.set("createEmbedMessage", modal);
		return await interaction.showModal(modal.data);
	},
};
