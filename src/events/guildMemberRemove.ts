import { Colors, EmbedBuilder } from "discord.js";
import i18next from "i18next";
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
				.setTitle(i18next.t("event.member.remove.title", { lng: member.guild.preferredLocale }))
				.setDescription(
					i18next.t("event.member.add.description", {
						lng: member.guild.preferredLocale,
						member,
						createdTimestamp: createdTimestamp,
						joinedTimestamp: joinedTimestamp,
						leftTimestamp: toTimestamp(),
					})
				)
				.setColor(Colors.Orange)
				.setTimestamp(new Date())
				.setFooter({ text: member.displayName, iconURL: member.displayAvatarURL() });

			await sendMessage(memberObject.channelId, { embeds: [templateEmbed] }, client);
			logger.debug(`Server "${member.guild.name}": ${member.displayName} just left the server!`);
		} catch (error) {
			logger.error("An error occurred while removing a member:", error);
		}
	},
};
