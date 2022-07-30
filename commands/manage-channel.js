const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const path = require("path");
const fs = require("fs");

module.exports = {
	managePermission: true,
	data: new SlashCommandBuilder()
		.setName("gestion-salon")
		.setDescription("Ajouter ou supprimer un salon.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("ajouter-salon")
				.setDescription("Ajouter un salon au Bot.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon à rajouter.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("supprimer-salon")
				.setDescription("Supprimer un salon du Bot.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon à supprimer.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("salons-list").setDescription("Afficher la liste complète des salons.")
		),
	async execute(interaction, client) {
		const subCommandName = interaction.options.getSubcommand();
		const channelId = interaction.options.getChannel("salon_id")?.id;

		if (!interaction.client.user.fetchFlags(PermissionsBitField.Flags.ManageChannels))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		const channelsPath = path.join(__dirname, "../data/channels.json");
		const channelsObjectFile = JSON.parse(fs.readFileSync(channelsPath, { encoding: "utf-8" }));

		if (!channelsObjectFile[interaction.guildId]) channelsObjectFile[interaction.guildId] = [];

		const channelsFile = channelsObjectFile[interaction.guildId];

		switch (subCommandName) {
			case "ajouter-salon": {
				const channel = await client.channels.fetch(channelId);

				if (!channel.parent) {
					return await interaction.reply({
						content: "Erreur: Ce n'est pas un salon mais une catégorie !",
						ephemeral: true,
					});
				}
				if (channelsFile.includes(channelId))
					return await interaction.reply({
						content: "Erreur: Ce salon a déjà été enregistré !",
						ephemeral: true,
					});
				channelsFile.push(channelId);
				break;
			}
			case "supprimer-salon": {
				if (!channelsFile.includes(channelId))
					return await interaction.reply({
						content: "Erreur: Ce salon n'a jamais été enregistré !",
						ephemeral: true,
					});
				channelsFile.splice(channelsFile.indexOf(channelId), 1);
				break;
			}
			case "salons-list": {
				const channelsList = [];
				channelsFile.forEach((channelId) => channelsList.push(`<#${channelId}>`));
				if (channelsFile.length === 0) channelsList.push("```diff\n- Aucun salon enregistré!```");
				return await interaction.reply({
					content: `Ci-dessous la liste des salons enregistrés:\n${channelsList}`,
					ephemeral: true,
				});
			}
		}

		client.authorizedChannels.set(interaction.guildId, channelsFile);
		fs.writeFile(channelsPath, JSON.stringify(channelsObjectFile), { encoding: "utf-8", flag: "w" }, (error) => {
			if (error) {
				if (error.code != "EEXIST") throw error;
			} else {
				console.log(
					`Server "${interaction.guild.name}": Channel "${interaction.guild.channels.cache.get(channelId).name}" ${
						subCommandName === "ajouter-salon" ? "added" : "removed"
					} successfuly.`
				);
			}
		});

		await interaction.reply({
			content: `Le salon <#${channelId}> a bien été ${subCommandName === "ajouter-salon" ? "ajouté" : "supprimé"}.`,
			ephemeral: true,
		});
	},
};
