import { Colors, EmbedBuilder } from "discord.js";
import i18next from "i18next";
import { MemberAddEvent } from "../types/collection";
import { sendMessage, toTimestamp } from "../utils/channel";
import logger from "../utils/logs/logger";

export const guildMemberAdd: MemberAddEvent = {
	name: "guildMemberAdd",
	async execute(member, client) {
		try {
			const guildId = member.guild.id;
			const memberObject = client.configurations.get(guildId)?.member;

			if (!memberObject?.add) return;

			const user = await client.users.fetch(member.id);
			const color = user.createdTimestamp < Date.now() - 1 * 60 * 60 * 1000 ? Colors.Green : Colors.Red;
			const createdTimestamp = toTimestamp(user.createdTimestamp);
			const joinedTimestamp = toTimestamp(member.joinedTimestamp);

			const templateEmbed = new EmbedBuilder()
				.setTitle(i18next.t("event.member.add.title", { lng: member.guild.preferredLocale }))
				.setDescription(
					i18next.t("event.member.add.description", {
						lng: member.guild.preferredLocale,
						member,
						createdTimestamp: createdTimestamp,
						joinedTimestamp: joinedTimestamp,
					})
				)
				.setColor(color)
				.setTimestamp(new Date())
				.setFooter({ text: member.displayName, iconURL: member.displayAvatarURL() });

			await sendMessage(memberObject.channelId, { embeds: [templateEmbed] }, client);
			logger.debug(`Server "${member.guild.name}": ${member.displayName} just joined the server!`);
		} catch (error) {
			logger.error("An error occurred while adding a new member:", error);
		}
	},
};
