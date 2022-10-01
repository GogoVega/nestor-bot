import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";
import { Command } from "../types/collection";
import { loadTranslations } from "../utils/translation";

export const helpCommand: Command = {
	data: new SlashCommandBuilder()
		.setName(i18next.t("command.help.build.name"))
		.setNameLocalizations(loadTranslations("command.help.build.name"))
		.setDescription(i18next.t("command.help.build.description"))
		.setDescriptionLocalizations(loadTranslations("command.help.build.description")),
	async execute(interaction, client) {
		const fields = client.commands.map((cmd) => ({
			name: cmd.data.name,
			value: cmd.data.description_localizations?.[interaction.locale] ?? "No Description.",
		}));

		const templateEmbed = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setTitle(i18next.t("command.help.available", { lng: interaction.locale }))
			.addFields(fields)
			.setTimestamp()
			.setFooter({
				text: interaction.guild?.members.me?.displayName ?? "Nestor",
				iconURL: client.user?.displayAvatarURL(),
			});

		await interaction.reply({ embeds: [templateEmbed], ephemeral: true });
	},
};
