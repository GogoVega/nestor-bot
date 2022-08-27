import { Colors, EmbedBuilder } from "discord.js";
import { MemberAddEvent } from "../types/collection";
import logger from "../utils/logs/logger";
import { sendMessage } from "../utils/sendMessage";

export const guildMemberAdd: MemberAddEvent = {
	name: "guildMemberAdd",
	async execute(member, client) {
		try {
			const guildId = member.guild.id;
			const memberObject = client.configurations.get(guildId)?.member;

			if (!memberObject?.add) return;

			const templateEmbed = new EmbedBuilder()
				.setTitle("Un nouveau membre vient de débarquer !")
				.setDescription(`**${member.nickname}** vient de bondir dans le serveur !`)
				.setColor(Colors.Green)
				.setTimestamp(new Date())
				.setFooter({ text: member.displayName, iconURL: member.avatarURL() ?? member.displayAvatarURL() });

			await sendMessage(memberObject.channelId, templateEmbed, client);
		} catch (error) {
			logger.error("An error occurred while adding a new member:", error);
		}
	},
};
