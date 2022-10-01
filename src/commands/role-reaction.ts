import { hyperlink, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";
import { Command, ReactionsFile } from "../types/collection";
import logger from "../utils/logs/logger";
import { readFile, writeFile } from "../utils/readWriteFile";
import { loadTranslations, translationBuilder } from "../utils/translation";

export const roleReaction: Command = {
	basePermission: PermissionsBitField.Flags.ManageRoles,
	data: new SlashCommandBuilder()
		.setName(i18next.t("command.reaction.build.name.role-reaction"))
		.setNameLocalizations(loadTranslations("command.reaction.build.name.role-reaction"))
		.setDescription(i18next.t("command.reaction.build.description.role-reaction"))
		.setDescriptionLocalizations(loadTranslations("command.reaction.build.description.role-reaction"))
		.addSubcommand((subcommand) =>
			translationBuilder(subcommand, "command.reaction.build.name.add-role")
				.addChannelOption((option) =>
					translationBuilder(option, "command.common.build.name.channelId").setRequired(true)
				)
				.addStringOption((option) =>
					translationBuilder(option, "command.common.build.name.messageId").setRequired(true)
				)
				.addRoleOption((option) => translationBuilder(option, "command.reaction.build.name.role").setRequired(true))
				.addStringOption((option) => translationBuilder(option, "command.reaction.build.name.emoji").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			translationBuilder(subcommand, "command.reaction.build.name.remove-role")
				.addChannelOption((option) =>
					translationBuilder(option, "command.common.build.name.channelId").setRequired(true)
				)
				.addStringOption((option) =>
					translationBuilder(option, "command.common.build.name.messageId").setRequired(true)
				)
				.addRoleOption((option) => translationBuilder(option, "command.reaction.build.name.role").setRequired(true))
				.addStringOption((option) => translationBuilder(option, "command.reaction.build.name.emoji").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			translationBuilder(subcommand, "command.reaction.build.name.roles-list").addStringOption((option) =>
				translationBuilder(option, "command.common.build.name.messageId")
			)
		),
	async execute(interaction, client) {
		if (!interaction.inGuild()) return;

		const { locale } = interaction;

		try {
			const channelId = interaction.options.getChannel("channel_id")?.id ?? "";
			const msgId = interaction.options.getString("message_id") ?? "";
			const role = interaction.options.getRole("role");
			const roleId = role?.id ?? "";
			const subCommandName = interaction.options.getSubcommand();

			const reactionsPath = "../../data/reactions.json";
			const reactionsObjectFile = (await readFile(reactionsPath)) as ReactionsFile;

			if (!reactionsObjectFile[interaction.guildId]) reactionsObjectFile[interaction.guildId] = {};

			const reactionsFile = reactionsObjectFile[interaction.guildId];

			switch (subCommandName) {
				case "add-role": {
					const bot = await interaction.guild?.members.fetch(client.user?.id ?? "");

					if (!bot) return;
					if (bot?.roles.highest.comparePositionTo(roleId) < 0)
						return await interaction.reply({
							content: i18next.t("command.error.roleSuperior", { lng: locale }),
							ephemeral: true,
						});
					if (role?.managed)
						return await interaction.reply({
							content: i18next.t("command.error.roleBot", { lng: locale }),
							ephemeral: true,
						});
					if (role?.name === "@everyone")
						return await interaction.reply({
							content: i18next.t("command.error.roleEveryone", { lng: locale }),
							ephemeral: true,
						});
					const channel = await client.channels.fetch(channelId);

					if (!channel?.isTextBased()) return;

					const message = await channel.messages.fetch(msgId);
					const emoji = interaction.options.getString("emoji", true);

					if (!reactionsFile[msgId]) reactionsFile[msgId] = { channel: channelId, values: [] };

					for (const reaction of reactionsFile[msgId].values) {
						if (reaction["emoji"] !== emoji) continue;
						if (reaction["roleId"].length >= 5)
							return await interaction.reply({
								content: i18next.t("command.error.roleMaxReactionr", { lng: locale }),
								ephemeral: true,
							});
						if (reaction["roleId"].includes(roleId))
							return await interaction.reply({
								content: i18next.t("command.error.roleAlreadyUsed", { lng: locale }),
								ephemeral: true,
							});

						reaction["roleId"].push(roleId);
						break;
					}

					if (reactionsFile[msgId].values.every((reaction) => reaction["emoji"] !== emoji))
						reactionsFile[msgId].values.push({ emoji: emoji, roleId: [roleId] });

					await message.react(emoji);
					break;
				}
				case "remove-role": {
					const channel = await client.channels.fetch(channelId);

					if (!channel?.isTextBased()) return;

					if (!reactionsFile[msgId])
						return await interaction.reply({
							content: i18next.t("command.error.noneEmoji", { lng: locale }),
							ephemeral: true,
						});

					const message = await channel.messages.fetch(msgId);
					const emoji = interaction.options.getString("emoji", true);

					for (const reaction of reactionsFile[msgId].values) {
						if (reaction["emoji"] !== emoji) continue;
						if (!reaction["roleId"].includes(roleId))
							return await interaction.reply({
								content: i18next.t("command.error.roleNotFound", { lng: locale }),
								ephemeral: true,
							});

						reaction["roleId"].splice(reaction["roleId"].indexOf(roleId), 1);

						if (reaction["roleId"].length === 0) {
							reactionsFile[msgId].values.splice(reactionsFile[msgId].values.indexOf(reaction), 1);
							await message?.reactions.resolve(reaction.emoji)?.users.remove(client.user?.id);
						}

						if (reactionsFile[msgId].values.length === 0) delete reactionsFile[msgId];

						break;
					}

					break;
				}
				case "roles-list": {
					const rolesList = [];

					if (msgId) {
						if (!reactionsFile[msgId] || !reactionsFile[msgId]?.values.length) {
							rolesList.push(`\`\`\`diff\n- ${i18next.t("command.reaction.noneRole", { lng: locale })}\n\`\`\``);
						} else {
							reactionsFile[msgId].values.forEach((role) =>
								rolesList.push(
									`${reactionsFile[msgId].values.indexOf(role) ? "\n" : ""}${role.emoji} - ${role.roleId.map(
										(id) => `<@&${id}>`
									)}`
								)
							);
						}
					} else {
						const messageIdList = Object.keys(reactionsFile);

						if (!messageIdList.length) {
							rolesList.push(`\`\`\`diff\n- ${i18next.t("command.reaction.noneRole", { lng: locale })}\n\`\`\``);
						} else {
							messageIdList.forEach((messageId) => {
								rolesList.push(
									`\n**${i18next.t("command.common.messageId", { lng: locale })}** : ${hyperlink(
										messageId,
										`<https://discord.com/channels/${interaction.guildId}/${reactionsFile[messageId].channel}/${messageId}>`
									)}`
								);
								reactionsFile[messageId].values.forEach((role) =>
									rolesList.push(`\n${role.emoji} - ${role.roleId.map((id) => `<@&${id}>`)}`)
								);
							});
						}
					}

					return await interaction.reply({
						content: `${i18next.t("command.reaction.list", {
							lng: locale,
							this: msgId ? "ce" : "chaque",
						})} :\n${rolesList}`,
						ephemeral: true,
					});
				}
			}

			client.reactions.set(interaction.guildId, reactionsFile);
			await writeFile(reactionsPath, reactionsObjectFile);

			logger.info(
				`Server "${interaction.guild?.name}": Role "${roleId}" ${
					subCommandName === "add-role" ? "added" : "removed"
				} successfully.`
			);

			await interaction.reply({
				content: i18next.t("command.reaction.roleAddedRemoved", {
					lng: locale,
					added: subCommandName === "add-role" ? "ajouté" : "supprimé",
					roleId: roleId,
				}),
				ephemeral: true,
			});
		} catch (error) {
			logger.error("Error during role-reaction command:", error);
			return await interaction.reply({
				content: i18next.t("command.error.checkMessageId", { lng: locale }),
				ephemeral: true,
			});
		}
	},
};
