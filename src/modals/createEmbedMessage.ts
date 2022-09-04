import { ActionRowBuilder, Colors, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Modals } from "../types/collection";

export const createEmbedMessage: Modals = {
	data: new ModalBuilder()
		.setCustomId("createEmbedMessage")
		.setTitle("Creation d'un message au format Embed")
		.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("titleInput")
					.setLabel("Le titre de votre message")
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("descriptionInput")
					.setLabel("Description de votre message")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder("Vous pouvez utilisez la syntax Markdown")
					.setRequired(true)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("fieldTitleInput")
					.setLabel("Titre du field")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder("Titre du sous-titre")
					.setRequired(false)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("fieldDescriptionInput")
					.setLabel("Description du field")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder("Description du sous-titre")
					.setRequired(false)
			)
			/* Not yet supported by discord.js
			new ActionRowBuilder().addComponents(
				new SelectMenuBuilder().setCustomId("theme").setPlaceholder("Choisissez une couleur.").addOptions(
					{
						label: "Rouge",
						value: "Red",
						emoji: "🔴",
					},
					{
						label: "Bleu",
						value: "Blue",
						emoji: "🔵",
					},
					{
						label: "Vert",
						value: "Green",
						emoji: "🟢",
					},
					{
						label: "Jaune",
						value: "Yellow",
						emoji: "🟡",
					},
					{
						label: "Orange",
						value: "Orange",
						emoji: "🟠",
					}
				)
			)*/
		),
	async execute(interaction, client) {
		const title = interaction.fields.getTextInputValue("titleInput");
		const description = interaction.fields.getTextInputValue("descriptionInput");
		const fieldTitle = interaction.fields.getTextInputValue("fieldTitleInput");
		const fieldDescription = interaction.fields.getTextInputValue("fieldDescriptionInput");
		// Not yet supported by discord.js
		// https://github.com/discordjs/discord.js/issues/8035
		// const color = this.color ?? Colors[interaction.getSelectMenuValues("color") ?? "White"];
		const color = this.color ?? Colors["White"];
		const iconURL = this.iconURL ?? this.iconImage?.url ?? client.user?.avatarURL() ?? "";

		if (!this.channelId || !description || !title) throw new Error("Missing channel ID, description or title!");

		const channel = await client.channels.fetch(this.channelId);

		if (!channel?.isTextBased()) return;

		const templateEmbed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(color)
			.setTimestamp(this.timestamp ? new Date() : null)
			.setFooter({ text: this.author ?? `${interaction.guild?.members.me?.displayName} • FabLAB`, iconURL: iconURL })
			.setImage(this.image ? this.image.url : null)
			.setThumbnail(this.thumbnail ? this.thumbnail.url : null);

		if (fieldTitle || fieldDescription)
			templateEmbed.addFields([
				{
					name: fieldTitle || "Aucun Sous-Titre",
					value: fieldDescription || "Aucune description",
				},
			]);

		await channel?.send({ embeds: [templateEmbed] });
		return await interaction.reply({
			content: ":white_check_mark: | Message envoyé.",
			ephemeral: true,
		});
	},
};
