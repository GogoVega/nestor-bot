import { ReactionEvent } from "../types/collection";
import logger from "../utils/logs/logger";
import { sendLog } from "../utils/logs/sendLog";

// Message Reaction Added
export const messageReactionAdded: ReactionEvent = {
	name: "messageReactionAdd",
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
				if (member?.roles.resolve(id)) return;
				roleList.push(id);
				await member?.roles.add(id, "Role add by autorole");
			});

			await sendLog(
				{ emoji: emoji, guildId: guildId, roleId: roleList, isAdded: true, reactionUser: user },
				null,
				client
			);
			logger.debug(
				`Server "${member.guild.name}": ${user.username} reacted with ${emoji} to get ${roleId || "nothing"}`
			);
		} catch (error) {
			logger.error("Error when adding a reaction to a message:", error);
			await user.send({ content: "Une erreur s'est produite en tentant de vous ajouter le rôle !" });
		}
	},
};
