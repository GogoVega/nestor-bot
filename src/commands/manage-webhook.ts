import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/collection";
import logger from "../utils/logs/logger";
import { readConfigurationsFile, writeConfigurationsFile } from "../utils/readWriteFile";

export const manageWebhook: Command = {
	basePermission: PermissionsBitField.Flags.ManageWebhooks,
	data: new SlashCommandBuilder()
		.setName("gestion-webhook")
		.setDescription("Ajouter ou supprimer un Webhook.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("ajouter-webhook")
				.setDescription("Ajouter un Webhook au Bot.")
				.addStringOption((option) =>
					option
						.setName("webhook_id")
						.setDescription("Veuillez renseigner l'identifiant du Webhook à ajouter.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("supprimer-webhook")
				.setDescription("Supprimer un Webhook du Bot.")
				.addStringOption((option) =>
					option
						.setName("webhook_id")
						.setDescription("Veuillez renseigner l'identifiant du Webhook à supprimer.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("webhooks-list").setDescription("Afficher la liste complète des Webhooks.")
		),
	async execute(interaction, client) {
		if (!interaction.inGuild()) return;

		const subCommandName = interaction.options.getSubcommand();
		const webhookId = interaction.options.getString("webhook_id") ?? "";
		const guildId = interaction.guildId;

		const configurationsFile = await readConfigurationsFile(guildId);
		const webhookArray = configurationsFile[guildId].webhooks;

		switch (subCommandName) {
			case "ajouter-webhook": {
				const guild = await client.guilds.fetch(guildId);
				const webhooks = await guild.fetchWebhooks();
				if (!webhooks.some((webhook) => webhook.id === webhookId))
					return await interaction.reply({
						content: "Erreur: L'identifiant reçu n'est pas un Webhook !",
						ephemeral: true,
					});
				if (webhookArray.includes(webhookId))
					return await interaction.reply({
						content: "Erreur: Ce Webhook a déjà été enregistré !",
						ephemeral: true,
					});
				webhookArray.push(webhookId);
				break;
			}
			case "supprimer-webhook": {
				if (!webhookArray.includes(webhookId))
					return await interaction.reply({
						content: "Erreur: Ce Webhook n'a jamais été enregistré !",
						ephemeral: true,
					});
				webhookArray.splice(webhookArray.indexOf(webhookId), 1);
				break;
			}
			case "webhooks-list": {
				const webhooksList: string[] = [];
				webhookArray.forEach((webhookId) => webhooksList.push(`<@${webhookId}>`));
				if (webhookArray.length === 0) webhooksList.push("```diff\n- Aucun Webhook enregistré!```");
				return await interaction.reply({
					content: `Ci-dessous la liste des Webhooks enregistrés:\n${webhooksList}`,
					ephemeral: true,
				});
			}
		}

		client.configurations.set(guildId, configurationsFile[guildId]);
		await writeConfigurationsFile(configurationsFile);

		logger.info(
			`Server "${interaction.guild?.name}": Webhook "${webhookId}" ${
				subCommandName === "ajouter-webhook" ? "added" : "removed"
			} successfuly.`
		);

		await interaction.reply({
			content: `Le Webhook <@${webhookId}> a bien été ${subCommandName === "ajouter-webhook" ? "ajouté" : "supprimé"}.`,
			ephemeral: true,
		});
	},
};
