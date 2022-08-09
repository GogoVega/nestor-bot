const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const path = require("path");
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("parametres-logs")
		.setDescription("Paramètres des logs.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("modifier-parametres")
				.setDescription("Modifier les paramètres.")
				.addChannelOption((option) => option.setName("salon_id").setDescription("ID du salon.").setRequired(true))
				.addBooleanOption((option) =>
					option.setName("button").setDescription("Voulez-vous activer les logs des boutons.")
				)
				.addBooleanOption((option) =>
					option.setName("command").setDescription("Voulez-vous activer les logs des commandes.")
				)
				.addBooleanOption((option) =>
					option.setName("reaction").setDescription("Voulez-vous activer les logs des réactions.")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("afficher-parametres").setDescription("Affiche les paramètres des logs.")
		),
	async execute(interaction, client) {
		const subCommandName = interaction.options.getSubcommand();
		const getChannelId = interaction.options.getChannel("salon_id")?.id;

		if (!interaction.channel.permissionsFor(interaction.user).has(PermissionsBitField.Flags.ManageChannels))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		const logsConfigurationPath = path.join(__dirname, "../data/logsConfiguration.json");
		const logsConfigurationObjectFile = JSON.parse(fs.readFileSync(logsConfigurationPath, { encoding: "utf-8" }));

		if (!logsConfigurationObjectFile[interaction.guildId]) logsConfigurationObjectFile[interaction.guildId] = {};

		const logsConfigurationFile = logsConfigurationObjectFile[interaction.guildId];

		switch (subCommandName) {
			case "modifier-parametres": {
				const channel = await client.channels.fetch(getChannelId);

				if (!channel.parent) {
					return await interaction.reply({
						content: "Erreur: Ce n'est pas un salon mais une catégorie !",
						ephemeral: true,
					});
				}

				logsConfigurationFile.channelId = getChannelId;
				for (const type of ["button", "command", "reaction"]) {
					const state = logsConfigurationFile[type];
					logsConfigurationFile[type] = interaction.options.getBoolean(type) || state || false;
				}
				break;
			}
			case "afficher-parametres": {
				const { button, channelId, command, reaction } = logsConfigurationFile;
				const parameters = [];
				const getState = function getState(parameter) {
					return parameter ? "Activé" : "Désactivé";
				};
				if (Object.keys(logsConfigurationFile).length === 0) {
					parameters.push("```diff\n- Aucun paramètre enregistré!```");
				} else {
					parameters.push(
						`\n• **Salon utilisé** : <#${channelId}>\n• **Log des boutons** : ${getState(
							button
						)}\n• **Log des commandes** : ${getState(command)}\n• **Log des réactions** : ${getState(reaction)}\n`
					);
				}
				return await interaction.reply({
					content: `Ci-dessous la liste des paramètres enregistrés:\n${parameters}`,
					ephemeral: true,
				});
			}
		}

		client.logsConfiguration.set(interaction.guildId, logsConfigurationFile);
		fs.writeFile(
			logsConfigurationPath,
			JSON.stringify(logsConfigurationObjectFile),
			{ encoding: "utf-8", flag: "w" },
			(error) => {
				if (error) {
					if (error.code != "EEXIST") throw error;
				} else {
					console.log(
						`Server "${interaction.guild.name}": The configuration parameters of the logs have been updated!`
					);
				}
			}
		);

		await interaction.reply({
			content: "Les paramètres de configuration des logs ont bien été mis à jour !",
			ephemeral: true,
		});
	},
};
