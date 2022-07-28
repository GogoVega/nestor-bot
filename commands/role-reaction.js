const { SlashCommandBuilder } = require("@discordjs/builders");
const { hyperlink, PermissionsBitField } = require("discord.js");
const { clientId } = require("../config.json");
const path = require("path");
const fs = require("fs");

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
		if (!interaction.client.user.fetchFlags(PermissionsBitField.Flags.ManageRoles))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		try {
			const channelId = interaction.options.getChannel("salon_id")?.id;
			const msgId = interaction.options.getString("message_id");
			const roleId = interaction.options.getRole("role")?.id;
			const subCommandName = interaction.options.getSubcommand();

			const reactionsPath = path.join(__dirname, "../data/reactions.json");
			const reactionsFile = JSON.parse(fs.readFileSync(reactionsPath, { encoding: "utf-8" }));

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
						reactionsFile[msgId].value = [];
					}
					if (
						reactionsFile[msgId].value.some((reaction) => reaction["emoji"] === emoji || reaction["roleId"] === roleId)
					)
						return await interaction.reply({
							content: "Erreur: Emoji ou rôle déjà utilisé !",
							ephemeral: true,
						});

					reactionsFile[msgId].value.push({ emoji: emoji, roleId: roleId });
					client.reactions.set(msgId, reactionsFile[msgId]);
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
					if (reactionsFile[msgId].value.every((reaction) => reaction["roleId"] !== roleId))
						return await interaction.reply({
							content: "Erreur: Aucun rôle ne correspond à votre requête !",
							ephemeral: true,
						});

					const [reaction] = reactionsFile[msgId].value.filter((reaction) => reaction.roleId === roleId);
					await message?.reactions.resolve(reaction.emoji)?.users.remove(clientId);

					if (reactionsFile[msgId].value.length === 1) {
						delete reactionsFile[msgId];
						client.reactions.delete(msgId);
						break;
					}
					reactionsFile[msgId].value.forEach((reaction) => {
						if (reaction["roleId"] === roleId)
							reactionsFile[msgId].value.splice(reactionsFile[msgId].value.indexOf(reaction), 1);
					});
					client.reactions.set(msgId, reactionsFile[msgId]);
					break;
				}
				case "roles-list": {
					const rolesList = [];

					if (msgId) {
						if (!reactionsFile[msgId] || !reactionsFile[msgId]?.value.length) {
							rolesList.push("```diff\n- Aucun rôle enregistré !```");
						} else {
							reactionsFile[msgId].value.forEach((role) =>
								rolesList.push(
									`${reactionsFile[msgId].value.indexOf(role) ? "\n" : ""}${role.emoji} - <@&${role.roleId}>`
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
								reactionsFile[messageId].value.forEach((role) =>
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

			fs.writeFile(reactionsPath, JSON.stringify(reactionsFile), { encoding: "utf-8", flag: "w" }, (error) => {
				if (error) {
					if (error.code != "EEXIST") throw error;
				} else {
					console.log(
						`Role "${interaction.options.getRole("role").name}" ${
							subCommandName === "ajouter-role" ? "added" : "removed"
						} successfully.`
					);
				}
			});

			await interaction.reply({
				content: `Le role <@&${roleId}> a bien été ${subCommandName === "ajouter-role" ? "ajouté" : "supprimé"}.`,
				ephemeral: true,
			});
		} catch (error) {
			console.error("Error during role-reaction command:", error);
			return await interaction.reply({
				content: "Erreur: Vérifiez l'ID du message ou du salon contenant le message !",
				ephemeral: true,
			});
		}
	},
};
