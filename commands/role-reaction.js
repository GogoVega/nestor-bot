const { SlashCommandBuilder } = require("@discordjs/builders");
const { hyperlink, PermissionsBitField } = require("discord.js");
const logger = require("../utils/logger.js");
const { readFile, writeFile } = require("../utils/readWriteFile.js");

module.exports = {
	managePermission: true,
	data: new SlashCommandBuilder()
		.setName("role-reaction")
		.setDescription("Ajouter ou supprimer un rôle à un message.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("ajouter-role")
				.setDescription("Ajouter un rôle à un message.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("Choisissez le salon contenant le message.").setRequired(true)
				)
				.addStringOption((option) => option.setName("message_id").setDescription("ID du message.").setRequired(true))
				.addRoleOption((option) =>
					option.setName("role").setDescription("Choisissez le rôle à rajouter.").setRequired(true)
				)
				.addStringOption((option) => option.setName("emoji").setDescription("Emoji pour ce rôle.").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("supprimer-role")
				.setDescription("Supprimer un rôle à un message.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("Choisissez le salon contenant le message.").setRequired(true)
				)
				.addStringOption((option) => option.setName("message_id").setDescription("ID du message.").setRequired(true))
				.addRoleOption((option) =>
					option.setName("role").setDescription("Choisissez le rôle à à supprimer.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("roles-list")
				.setDescription("Afficher la liste complète des rôles par message ou pour un message.")
				.addStringOption((option) => option.setName("message_id").setDescription("ID du message."))
		),
	async execute(interaction, client) {
		if (!interaction.channel.permissionsFor(interaction.user).has(PermissionsBitField.Flags.ManageRoles))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		try {
			const channelId = interaction.options.getChannel("salon_id")?.id;
			const msgId = interaction.options.getString("message_id");
			const roleId = interaction.options.getRole("role")?.id;
			const subCommandName = interaction.options.getSubcommand();

			const reactionsPath = "../data/reactions.json";
			const reactionsObjectFile = await readFile(reactionsPath);

			if (!reactionsObjectFile[interaction.guildId]) reactionsObjectFile[interaction.guildId] = {};

			const reactionsFile = reactionsObjectFile[interaction.guildId];

			switch (subCommandName) {
				case "ajouter-role": {
					const bot = await interaction.guild?.members.fetch(client.user.id);
					if (bot?.roles.highest.comparePositionTo(roleId) < 0)
						return await interaction.reply({
							content: "Erreur: Vous ne pouvez pas utiliser un rôle supérieur au Bot !",
							ephemeral: true,
						});

					const channel = await client.channels.fetch(channelId);
					const message = await channel.messages.fetch(msgId);
					const emoji = interaction.options.getString("emoji");

					if (!reactionsFile[msgId]) {
						reactionsFile[msgId] = {};
						reactionsFile[msgId].channel = channelId;
						reactionsFile[msgId].values = [];
					}
					if (
						reactionsFile[msgId].values.some((reaction) => reaction["emoji"] === emoji || reaction["roleId"] === roleId)
					)
						return await interaction.reply({
							content: "Erreur: Emoji ou rôle déjà utilisé !",
							ephemeral: true,
						});

					reactionsFile[msgId].values.push({ emoji: emoji, roleId: roleId });
					await message.react(emoji);
					break;
				}
				case "supprimer-role": {
					const channel = await client.channels.fetch(channelId);
					const message = await channel.messages.fetch(msgId);

					if (!reactionsFile[msgId])
						return await interaction.reply({
							content: "Erreur: Aucun emoji utilisé pour ce message !\nVérifiez l'ID du message !",
							ephemeral: true,
						});
					if (reactionsFile[msgId].values.every((reaction) => reaction["roleId"] !== roleId))
						return await interaction.reply({
							content: "Erreur: Aucun rôle ne correspond à votre requête !",
							ephemeral: true,
						});

					const [reaction] = reactionsFile[msgId].values.filter((reaction) => reaction.roleId === roleId);
					await message?.reactions.resolve(reaction.emoji)?.users.remove(client.user.id);

					if (reactionsFile[msgId].values.length === 1) {
						delete reactionsFile[msgId];
						break;
					}
					reactionsFile[msgId].values.forEach((reaction) => {
						if (reaction["roleId"] === roleId)
							reactionsFile[msgId].values.splice(reactionsFile[msgId].values.indexOf(reaction), 1);
					});
					break;
				}
				case "roles-list": {
					const rolesList = [];

					if (msgId) {
						if (!reactionsFile[msgId] || !reactionsFile[msgId]?.values.length) {
							rolesList.push("```diff\n- Aucun rôle enregistré !```");
						} else {
							reactionsFile[msgId].values.forEach((role) =>
								rolesList.push(
									`${reactionsFile[msgId].values.indexOf(role) ? "\n" : ""}${role.emoji} - <@&${role.roleId}>`
								)
							);
						}
					} else {
						const messageIdList = Object.keys(reactionsFile);

						if (!messageIdList.length) {
							rolesList.push("```diff\n- Aucun rôle enregistré !```");
						} else {
							messageIdList.forEach((messageId) => {
								rolesList.push(
									`\n**ID du message** : ${hyperlink(
										messageId,
										`<https://discord.com/channels/${interaction.guildId}/${reactionsFile[messageId].channel}/${messageId}>`
									)}`
								);
								reactionsFile[messageId].values.forEach((role) =>
									rolesList.push(`\n${role.emoji} - <@&${role.roleId}>`)
								);
							});
						}
					}

					return await interaction.reply({
						content: `Ci-dessous la liste des rôles enregistrés pour ${
							msgId ? "ce" : "chaque"
						} message :\n${rolesList}`,
						ephemeral: true,
					});
				}
			}

			client.reactions.set(interaction.guildId, reactionsFile);
			await writeFile(reactionsPath, reactionsObjectFile);

			logger.info(
				`Server "${interaction.guild.name}": Role "${interaction.options.getRole("role").name}" ${
					subCommandName === "ajouter-role" ? "added" : "removed"
				} successfully.`
			);

			await interaction.reply({
				content: `Le role <@&${roleId}> a bien été ${subCommandName === "ajouter-role" ? "ajouté" : "supprimé"}.`,
				ephemeral: true,
			});
		} catch (error) {
			logger.error("Error during role-reaction command:", error);
			return await interaction.reply({
				content: "Erreur: Vérifiez l'ID du message ou du salon contenant le message !",
				ephemeral: true,
			});
		}
	},
};
