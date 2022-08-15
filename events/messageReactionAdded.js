const logger = require("../utils/logger.js");
const { sendLog } = require("../utils/sendLog.js");

// Message Reaction Added
module.exports = {
	name: "messageReactionAdd",
	async execute(reaction, user, client) {
		if (user.bot) return;

		try {
			await reaction.fetch();

			const reactionsRaw = client.reactions.get(reaction.message.guildId);

			if (!reactionsRaw) return;

			const reactionsMessage = reactionsRaw[reaction.message.id];

			if (!reactionsMessage) return;

			const [reactionObject] = reactionsMessage.values.filter((data) => data.emoji === reaction.emoji.name);

			if (!reactionObject) return;

			const { guildId } = reaction.message;
			const { emoji, roleId } = reactionObject;
			const guild = await client.guilds.fetch(guildId);
			const member = await guild?.members.fetch(user.id);

			await member?.roles.add(reactionObject.roleId);
			await sendLog(
				{ emoji: emoji, guildId: guildId, roleId: roleId, isAdded: true, reactionUser: user },
				null,
				client
			);
		} catch (error) {
			logger.error("Error when adding a reaction to a message:", error);
			await user.send({ content: "Une erreur s'est produite en tentant de vous ajouter le rôle !" });
		}
	},
};
