import { Interaction, Colors, EmbedBuilder, User, PartialUser, Locale } from "discord.js";
import i18next from "i18next";
import { sendMessage } from "../channel";
import { MyClient } from "../../types/client";
import { Configuration } from "../../types/collection";

type ReactionLog = {
	emoji: string;
	guildId: string | null;
	roleId: string[];
	isAdded: boolean;
	reactionUser: User | PartialUser;
};

function createLogsMessage(args: Configuration, locale: Locale): string {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { webhooks, ...newArgs } = args;
	const logsMessage: string[] = [];

	for (const [key, value] of Object.entries(newArgs as Omit<Configuration, "webhooks">)) {
		logsMessage.push(`\n\n• **${key.toUpperCase()}**`);

		if (value.channelId === "") {
			logsMessage.push(`\n\`\`\`diff\n- ${i18next.t("command.parameters.noneParameter", { lng: locale })}\`\`\``);
			continue;
		}

		for (const [name, log] of Object.entries(value)) {
			logsMessage.push(`\n  • ${i18next.t(`command.parameters.${name}`, { lng: locale })} ${getLogState(log, locale)}`);
		}
	}

	return logsMessage.toString().replace(/,/gm, "");
}

function getLogState(parameter: boolean | string | string[], locale: Locale) {
	if (typeof parameter === "string") {
		return `<#${parameter}>`;
	} else if (typeof parameter === "object") {
		if (parameter.length === 0) return i18next.t("command.parameters.noneChannel", { lng: locale });
		return parameter.map((channelId) => `<#${channelId}> `);
	}

	return i18next.t(`command.parameters.${parameter ? "active" : "disable"}`, { lng: locale });
}

// Send logs message
async function sendLog(reaction: ReactionLog | null, interaction: Interaction | null, client: MyClient) {
	const logParameters = client.configurations.get(interaction?.guildId ?? reaction?.guildId ?? "")?.interaction;

	if (!logParameters) return;

	const user = interaction?.user || reaction?.reactionUser;
	const templateEmbed = new EmbedBuilder()
		.setTimestamp(new Date())
		.setFooter({ text: user?.tag ?? "", iconURL: user?.displayAvatarURL() });

	if (reaction) {
		if (!logParameters.reaction) return;

		const { emoji, roleId, isAdded } = reaction;
		const title = i18next.t(`event.log.role${isAdded ? "Added" : "Removed"}`, {
			lng: interaction?.guild?.preferredLocale,
			count: roleId.length,
		});
		const description = i18next.t(`event.log.reaction${isAdded ? "Added" : "Removed"}`, {
			lng: interaction?.guild?.preferredLocale,
			count: roleId.length,
			userId: user?.id,
			emoji: emoji,
			roleId: roleId.map((id) => ` <@&${id}>`),
		});

		if (roleId.length === 0) return;

		templateEmbed
			.setTitle(title)
			.setDescription(description)
			.setColor(isAdded ? Colors.Orange : Colors.Purple);
	} else if (interaction) {
		if (!logParameters["command"]) return;

		const isCommand = interaction.isCommand();
		const interactionName: string[] = [];

		if (interaction.isChatInputCommand()) {
			const subCommandName = interaction.options?.getSubcommand(false);
			interactionName.push(`${interaction.commandName.concat(" ", subCommandName || "")}`);
		} else if (interaction.isContextMenuCommand() || interaction.isAutocomplete()) {
			interactionName.push(interaction.commandName);
		} else {
			interactionName.push(interaction.customId);
		}

		templateEmbed
			.setTitle(
				i18next.t(`event.log.${isCommand ? "command" : "button"}Used`, { lng: interaction?.guild?.preferredLocale })
			)
			.setDescription(
				i18next.t(`event.log.${isCommand ? "command" : "button"}LogMessage`, {
					lng: interaction?.guild?.preferredLocale,
					interactionName: interactionName,
					userId: user?.id,
					channelId: interaction.channel?.id,
				})
			)
			.setColor(isCommand ? Colors.Yellow : Colors.Blue);
	}

	await sendMessage(logParameters.channelId, { embeds: [templateEmbed] }, client);
}

export { createLogsMessage, getLogState, sendLog };
