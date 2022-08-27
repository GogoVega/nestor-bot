import { Colors, EmbedBuilder } from "discord.js";
import { MemberRemoveEvent } from "../types/collection";
import logger from "../utils/logs/logger";
import { sendMessage } from "../utils/sendMessage";

export const guildMemberRemove: MemberRemoveEvent = {
	name: "guildMemberRemove",
	async execute(member, client) {
		try {
			const guildId = member.guild.id;
			const memberObject = client.configurations.get(guildId)?.member;

			if (!memberObject?.remove) return;

			const templateEmbed = new EmbedBuilder()
				.setTitle("Un membre vient de nous quitter !")
				.setDescription(`**${member.nickname}** vient de bondir hors du serveur !`)
				.setColor(Colors.Orange)
				.setTimestamp(new Date())
				.setFooter({ text: member.displayName, iconURL: member.avatarURL() ?? member.displayAvatarURL() });

			await sendMessage(memberObject.channelId, templateEmbed, client);
		} catch (error) {
			logger.error("An error occurred while removing a member:", error);
		}
	},
};
