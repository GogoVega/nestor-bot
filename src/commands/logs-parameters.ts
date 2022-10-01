import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";
import { Command, ConfigurationsProperty, Entry } from "../types/collection";
import { isCategory } from "../utils/channel";
import logger from "../utils/logs/logger";
import { createLogsMessage } from "../utils/logs/sendLog";
import { readConfigurationsFile, writeConfigurationsFile } from "../utils/readWriteFile";
import { loadTranslations, translationBuilder } from "../utils/translation";

enum logName {
	"edit-settings-interactions" = "interaction",
	"edit-settings-messages" = "message",
	"edit-settings-members" = "member",
}

export const logParameters: Command = {
	basePermission: PermissionsBitField.Flags.ViewAuditLog,
	data: new SlashCommandBuilder()
		.setName(i18next.t("command.parameters.build.name.logs"))
		.setNameLocalizations(loadTranslations("command.parameters.build.name.logs"))
		.setDescription(i18next.t("command.parameters.build.description.logs"))
		.setDescriptionLocalizations(loadTranslations("command.parameters.build.description.logs"))
		.addSubcommand((subcommand) =>
			translationBuilder(subcommand, "command.parameters.build.name.edit-interactions")
				.addChannelOption((option) =>
					translationBuilder(option, "command.parameters.build.name.channelId").setRequired(true)
				)
				.addBooleanOption((option) => translationBuilder(option, "command.parameters.build.name.command"))
				.addBooleanOption((option) => translationBuilder(option, "command.parameters.build.name.reaction"))
		)
		.addSubcommand((subcommand) =>
			translationBuilder(subcommand, "command.parameters.build.name.edit-messages")
				.addChannelOption((option) =>
					translationBuilder(option, "command.parameters.build.name.channelId").setRequired(true)
				)
				.addChannelOption((option) => translationBuilder(option, "command.parameters.build.name.add-channelId"))
				.addChannelOption((option) => translationBuilder(option, "command.parameters.build.name.remove-channelId"))
				.addBooleanOption((option) => translationBuilder(option, "command.parameters.build.name.update"))
				.addBooleanOption((option) => translationBuilder(option, "command.parameters.build.name.delete"))
		)
		.addSubcommand((subcommand) =>
			translationBuilder(subcommand, "command.parameters.build.name.edit-members")
				.addChannelOption((option) =>
					translationBuilder(option, "command.parameters.build.name.channelId").setRequired(true)
				)
				.addBooleanOption((option) => translationBuilder(option, "command.parameters.build.name.add"))
				.addBooleanOption((option) => translationBuilder(option, "command.parameters.build.name.remove"))
		)
		.addSubcommand((subcommand) => translationBuilder(subcommand, "command.parameters.build.name.show-parameters")),
	async execute(interaction, client) {
		const channelId = interaction.options.getChannel("channel_id")?.id;
		const channelAdded = interaction.options.getChannel("add_channel_id")?.id;
		const channelRemoved = interaction.options.getChannel("remove_channel_id")?.id;
		const subCommandName = interaction.options.getSubcommand();
		const guildId = interaction.guildId ?? "";
		const { locale } = interaction;

		for (const id of [channelId, channelAdded, channelRemoved]) {
			if (!id) continue;

			const channel = await client.channels.fetch(id ?? "");

			if (isCategory(channel)) {
				return await interaction.reply({
					content: i18next.t("command.error.channelCategory", { lng: locale }),
					ephemeral: true,
				});
			}
		}

		const configurationsFile = await readConfigurationsFile(guildId);
		const configurationsObject = configurationsFile[guildId];

		function modifyLogParameters(logObject: ConfigurationsProperty) {
			const log = Object.entries(logObject) as Entry<ConfigurationsProperty>[];

			for (const [key, value] of log) {
				if (key === "channelsId") {
					if (channelAdded) {
						if (value.includes(channelAdded)) return i18next.t("command.error.channelAlreadySaved", { lng: locale });

						value.push(channelAdded);
					} else if (channelRemoved) {
						if (!value.includes(channelRemoved)) return i18next.t("command.error.channelNeverSaved", { lng: locale });

						value.splice(value.indexOf(channelRemoved), 1);
					}

					continue;
				}

				if (key === "channelId") {
					logObject[key] = channelId ?? "";
					continue;
				}

				logObject[key] = interaction.options.getBoolean(key) ?? value ?? false;
			}

			return "";
		}

		switch (subCommandName) {
			case "edit-settings-interactions":
			case "edit-settings-messages":
			case "edit-settings-members": {
				if (!channelId) throw new Error("Error: channelId missing for logs registration!");

				const logKey = logName[subCommandName as keyof typeof logName];
				const logObject = configurationsObject[logKey] as ConfigurationsProperty;

				const error = modifyLogParameters(logObject);

				if (error)
					return await interaction.reply({
						content: error,
						ephemeral: true,
					});

				break;
			}
			case "show-parameters": {
				return await interaction.reply({
					content: i18next.t("command.parameters.list", {
						lng: locale,
						msg: createLogsMessage(configurationsObject, locale),
					}),
					ephemeral: true,
				});
			}
		}

		client.configurations.set(guildId, configurationsFile[guildId]);
		await writeConfigurationsFile(configurationsFile);

		logger.info(`Server "${interaction.guild?.name}": The configuration parameters of the logs have been updated!`);

		await interaction.reply({
			content: i18next.t("command.parameters.updated", { lng: locale }),
			ephemeral: true,
		});
	},
};
