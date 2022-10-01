import i18next from "i18next";
import { ReactionEvent } from "../types/collection";
import logger from "../utils/logs/logger";
import { sendLog } from "../utils/logs/sendLog";

// Message Reaction Removed
export const messageReactionRemoved: ReactionEvent = {
	name: "messageReactionRemove",
	async execute(reaction, user, client) {
		if (user.bot) return;

		try {
			await reaction.fetch();

			const guildId = reaction.message.guildId ?? "";
			const reactionsRaw = client.reactions.get(guildId);

			if (!reactionsRaw) return;

			const reactionsMessage = reactionsRaw[reaction.message.id];

			if (!reactionsMessage) return;

			const [reactionObject] = reactionsMessage.values.filter((data) => data.emoji === reaction.emoji.name);

			if (!reactionObject) return;

			const { emoji, roleId } = reactionObject;
			const guild = await client.guilds.fetch(guildId);
			const member = await guild?.members.fetch(user.id);
			const roleList: string[] = [];

			roleId.forEach(async (id) => {
				if (!member?.roles.resolve(id)) return;
				roleList.push(id);
				await member?.roles.remove(roleId, "Role remove by autorole");
			});

			await sendLog(
				{ emoji: emoji, guildId: guildId, roleId: roleList, isAdded: false, reactionUser: user },
				null,
				client
			);
			logger.debug(
				`Server "${member.guild.name}": ${user.username} unreacted ${emoji} to remove ${roleId || "nothing"}`
			);
		} catch (error) {
			logger.error("Error when removing a reaction to a message:", error);
			await user.send({ content: i18next.t("event.error.removeRoleFailed") });
		}
	},
};
