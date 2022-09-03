import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types/collection";

export const createEmbedMessage: Command = {
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
			option.setName("icon-url").setDescription("Souhaitez-vous ajouter une icône à votre message ? (par défaut: Bot)")
		)
		.addAttachmentOption((option) =>
			option.setName("icon-image").setDescription("Veuillez glissez l'image de l'icône.")
		)
		.addAttachmentOption((option) =>
			option.setName("miniature").setDescription("Veuillez glissez l'image de la miniature.")
		)
		.addAttachmentOption((option) => option.setName("image").setDescription("Veuillez glissez l'image.")),
	async execute(interaction, client) {
		const modal = client.modals.get("createEmbedMessage");
		if (!modal) return;
		modal.channelId = interaction.options.getChannel("salon_id", true).id;

		modal.author = interaction.options.getString("author");
		modal.color = parseInt(interaction.options.getString("color")?.split("#").pop() ?? "") || null;
		modal.timestamp = interaction.options.getBoolean("timestamp");

		modal.image = interaction.options.getAttachment("image");
		modal.iconURL = interaction.options.getString("icon-url");
		modal.iconImage = interaction.options.getAttachment("icon-image");
		modal.thumbnail = interaction.options.getAttachment("miniature");

		const regex =
			/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
		if (modal.iconURL?.match(regex) === null)
			return await interaction.reply({
				content: "Erreur: Veuillez vérifier l'URL de votre icône !",
				ephemeral: true,
			});

		client.modals.set("createEmbedMessage", modal);
		return await interaction.showModal(modal.data);
	},
};
