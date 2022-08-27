import { Interaction, Colors, EmbedBuilder, User, PartialUser } from "discord.js";
import { MyClient } from "../../types/client";

type ReactionLog = {
	emoji: string;
	guildId: string | null;
	roleId: string;
	isAdded: boolean;
	reactionUser: User | PartialUser;
};

// Send logs message
export async function sendLog(reaction: ReactionLog | null, interaction: Interaction | null, client: MyClient) {
	if (!reaction) return;
	const { emoji, guildId, roleId, isAdded, reactionUser } = reaction;
	const logParameters = client.configurations.get(interaction?.guildId ?? guildId ?? "")?.interaction;

	if (!logParameters) return;

	const user = interaction?.user || reactionUser;
	const templateEmbed = new EmbedBuilder()
		.setTimestamp(new Date())
		.setFooter({ text: user?.tag ?? "", iconURL: user?.avatarURL() ?? "" });

	if (reactionUser) {
		if (!logParameters.reaction) return;

		templateEmbed
			.setTitle(`Un rôle vient d'être ${isAdded ? "attribué" : "retiré"} !`)
			.setDescription(
				`<@${user?.id}> vient de réagir avec l'émoji ${emoji} pour ${
					isAdded ? "obtenir" : "quitter"
				} le rôle <@&${roleId}>.\n`
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

	const channel = await client.channels.fetch(logParameters.channelId);

	if (!channel || !channel.isTextBased()) return;

	await channel?.send({ embeds: [templateEmbed] });
}
