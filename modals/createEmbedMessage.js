const {
	ActionRowBuilder,
	Colors,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");

module.exports = {
	channelId: "",
	author: "",
	color: "",
	timestamp: null,
	image: {},
	iconURL: "",
	iconImage: {},
	thumbnail: {},
	data: new ModalBuilder()
		.setCustomId("createEmbedMessage")
		.setTitle("Creation d'un message au format Embed")
		.addComponents(
			// @ts-ignore
			new ActionRowBuilder().addComponents(
				// @ts-ignore
				new TextInputBuilder()
					.setCustomId("titleInput")
					.setLabel("Le titre de votre message")
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
			),
			new ActionRowBuilder().addComponents(
				// @ts-ignore
				new TextInputBuilder()
					.setCustomId("descriptionInput")
					.setLabel("Description de votre message")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder("Vous pouvez utilisez la syntax Markdown")
					.setRequired(true)
			),
			new ActionRowBuilder().addComponents(
				// @ts-ignore
				new TextInputBuilder()
					.setCustomId("fieldTitleInput")
					.setLabel("Titre du field")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder("Titre du sous-titre")
					.setRequired(false)
			),
			new ActionRowBuilder().addComponents(
				// @ts-ignore
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
		// const color = this.color.split("#").pop() || Colors[interaction.getSelectMenuValues("color") || "White"];
		const color = this.color.split("#").pop() || Colors["White"];
		const iconURL = this.iconURL || this.iconImage?.url || client.user.avatarURL();

		if (!this.channelId || !description || !title) throw new Error("Missing channel ID, description or title!");

		const channel = await client.channels.fetch(this.channelId);

		const templateEmbed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(color)
			.setTimestamp(this.timestamp ? new Date() : null)
			.setFooter({ text: this.author || "EPHEC - ISAT • FabLAB", iconURL: iconURL })
			.setImage(this.image?.url)
			.setThumbnail(this.thumbnail?.url);

		if (fieldTitle || fieldDescription)
			templateEmbed.addFields([
				{
					name: fieldTitle || "Aucun Sous-Titre",
					value: fieldDescription || "Aucune description",
				},
			]);

		await channel.send({ embeds: [templateEmbed] });
		return await interaction.reply({
			content: ":white_check_mark: | Message envoyé.",
			ephemeral: true,
		});
	},
};
