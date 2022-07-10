const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");
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
				.addStringOption((option) =>
					option.setName("salon_id").setDescription("ID du salon à rajouter.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("supprimer-salon")
				.setDescription("Supprimer un salon du Bot.")
				.addStringOption((option) =>
					option.setName("salon_id").setDescription("ID du salon à supprimer.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("salons-list").setDescription("Afficher la liste complète des salons.")
		),
	async execute(interaction) {
		const channelId = interaction.options.getString("salon_id");
		const subcommandName = interaction.options.getSubcommand();

		if (!interaction.client.user.fetchFlags(Permissions.FLAGS.MANAGE_CHANNELS))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		if (
			interaction.guild.channels.cache.every((channel) => channel.id !== channelId) &&
			subcommandName !== "salons-list"
		)
			return await interaction.reply({
				content: "Erreur: Vérifiez l'ID du salon!",
				ephemeral: true,
			});

		const channelsIdPath = path.join(__dirname, "../data/channelsId.json");
		const channelsIdFiles = JSON.parse(fs.readFileSync(channelsIdPath, { encoding: "utf-8" }));

		switch (subcommandName) {
			case "ajouter-salon": {
				if (channelsIdFiles.channelsId.every((channel) => channel !== channelId))
					channelsIdFiles.channelsId.push(channelId);
				break;
			}
			case "supprimer-salon": {
				if (channelsIdFiles.channelsId.some((channel) => channel === channelId))
					channelsIdFiles.channelsId.splice(channelsIdFiles.channelsId.indexOf(channelId));
				break;
			}
			case "salons-list": {
				const channelsList = [];
				channelsIdFiles.channelsId.forEach((channelId) => channelsList.push(`<#${channelId}>\n`));
				if (channelsIdFiles.channelsId.length === 0) channelsList.push("```diff\n- Aucun salon enregistré!```");
				return await interaction.reply({
					content: `Ci-dessous la liste des salons enregistrés:\n${channelsList}`,
					ephemeral: true,
				});
			}
		}

		fs.writeFile(channelsIdPath, JSON.stringify(channelsIdFiles), { encoding: "utf-8", flag: "w" }, (error) => {
			if (error) {
				if (error.code != "EEXIST") throw error;
			} else {
				console.log(
					`Channel "${interaction.guild.channels.cache.get(channelId).name}" ${
						subcommandName === "ajouter-salon" ? "added" : "removed"
					} successfuly.`
				);
			}
		});

		await interaction.reply({
			content: `Le salon <#${channelId}> a bien été ${subcommandName === "ajouter-salon" ? "ajouté" : "supprimé"}.`,
			ephemeral: true,
		});
	},
};
