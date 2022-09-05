import { Interaction, Colors, EmbedBuilder, User, PartialUser } from "discord.js";
import { sendMessage } from "../channel";
import { MyClient } from "../../types/client";
import { Configurations } from "../../types/collection";

enum logMessageContent {
	add = "**Log des nouveaux membres** :",
	button = "**Log des boutons** :",
	channelId = "**Salon utilisé** :",
	channelsId = "**Salons autorisés** :",
	command = "**Log des commandes** :",
	delete = "**Log des messages supprimés** :",
	reaction = "**Log des réactions** :",
	remove = "**Log des membres sortants** :",
	update = "**Log des messages édités** :",
}

type ReactionLog = {
	emoji: string;
	guildId: string | null;
	roleId: string[];
	isAdded: boolean;
	reactionUser: User | PartialUser;
};

function createLogsMessage(args: Configurations): string {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { channels, ...newArgs } = args;
	const logsMessage: string[] = [];

	for (const [key, value] of Object.entries(newArgs as Omit<Configurations, "channels">)) {
		logsMessage.push(`\n\n• **${key.toUpperCase()}**`);

		if (value.channelId === "") {
			logsMessage.push("\n```diff\n- Aucun paramètre enregistré!```");
			continue;
		}

		for (const [name, log] of Object.entries(value)) {
			logsMessage.push(`\n  • ${logMessageContent[name as keyof typeof logMessageContent]} ${getLogState(log)}`);
		}
	}

	return logsMessage.toString().replace(/,/gm, "");
}

function getLogState(parameter: boolean | string | string[]) {
	if (typeof parameter === "string") {
		return `<#${parameter}>`;
	} else if (typeof parameter === "object") {
		if (parameter.length === 0) return "Aucun salon enregistré";
		return parameter.map((channelId) => `<#${channelId}> `);
	}

	return parameter ? "Activé" : "Désactivé";
}

// Send logs message
async function sendLog(reaction: ReactionLog | null, interaction: Interaction | null, client: MyClient) {
	const logParameters = client.configurations.get(interaction?.guildId ?? reaction?.guildId ?? "")?.interaction;

	if (!logParameters) return;

	const user = interaction?.user || reaction?.reactionUser;
	const templateEmbed = new EmbedBuilder()
		.setTimestamp(new Date())
		.setFooter({ text: user?.tag ?? "", iconURL: user?.avatarURL() ?? "" });

	if (reaction) {
		if (!logParameters.reaction) return;

		const { emoji, roleId, isAdded } = reaction;
		const title =
			roleId.length > 1
				? `Plusieurs rôles viennent d'être ${isAdded ? "attribués" : "retirés"} !`
				: `Un rôle vient d'être ${isAdded ? "attribué" : "retiré"} !`;

		if (roleId.length === 0) return;

		templateEmbed
			.setTitle(title)
			.setDescription(
				`<@${user?.id}> vient de réagir avec l'émoji ${emoji} pour ${isAdded ? "obtenir" : "quitter"} ${
					roleId.length > 1 ? "les rôles" : "le rôle"
				}${roleId.map((id) => ` <@&${id}>`)}.\n`
			)
			.setColor(isAdded ? Colors.Orange : Colors.Purple);
	} else if (interaction) {
		if (!interaction.isCommand() && !interaction.isButton()) return;
		if (!logParameters[interaction.isCommand() ? "command" : "button"]) return;

		const isCommand = interaction.isCommand();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const interactionName = interaction.commandName ?? interaction.customId;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const subCommandName = interaction.options?.getSubcommand(false);

		templateEmbed
			.setTitle(isCommand ? "Une commande vient d'être utilisée !" : "Un bouton vient d'être appuyé !")
			.setDescription(
				`• **Type d'interaction** : ${
					isCommand ? "Commande" : "Bouton"
				}\n• **Nom de l'intéraction** : \`${interactionName}${
					subCommandName ? " ".concat(subCommandName) : ""
				}\`\n• **Utilisateur concerné** : <@${user?.id}>\n• **Salon utilisé** : <#${interaction.channel?.id}>\n`
			)
			.setColor(isCommand ? Colors.Yellow : Colors.Blue);
	}

	await sendMessage(logParameters.channelId, templateEmbed, client);
}

export { createLogsMessage, getLogState, sendLog };
