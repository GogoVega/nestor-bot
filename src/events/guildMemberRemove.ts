import { Colors, EmbedBuilder } from "discord.js";
import { MemberRemoveEvent } from "../types/collection";
import { sendMessage, toTimestamp } from "../utils/channel";
import logger from "../utils/logs/logger";

export const guildMemberRemove: MemberRemoveEvent = {
	name: "guildMemberRemove",
	async execute(member, client) {
		try {
			const guildId = member.guild.id;
			const memberObject = client.configurations.get(guildId)?.member;

			if (!memberObject?.remove) return;

			const user = await client.users.fetch(member.id);
			const createdTimestamp = toTimestamp(user.createdTimestamp);
			const joinedTimestamp = toTimestamp(member.joinedTimestamp);

			const templateEmbed = new EmbedBuilder()
				.setTitle("Un membre vient de nous quitter !")
				.setDescription(
					`• **Nom d'utilisateur** : <@${member.id}> - ${member.displayName} (${
						member.id
					})\n• **Compte créé le** : <t:${createdTimestamp}:f> (<t:${createdTimestamp}:R>)\n• **Nous a rejoint le** : <t:${joinedTimestamp}:f> (<t:${joinedTimestamp}:R>)\n• **Nous a quitté le** : <t:${toTimestamp()}:f> (<t:${toTimestamp()}:R>)`
				)
				.setColor(Colors.Orange)
				.setTimestamp(new Date())
				.setFooter({ text: member.displayName, iconURL: member.avatarURL() ?? member.displayAvatarURL() });

			await sendMessage(memberObject.channelId, templateEmbed, client);
			logger.debug(`Server "${member.guild.name}": ${member.displayName} just left the server!`);
		} catch (error) {
			logger.error("An error occurred while removing a member:", error);
		}
	},
};
