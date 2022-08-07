const { sendLog } = require("../utils/sendLog.js");

// Message Reaction Removed
module.exports = {
	name: "messageReactionRemove",
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

			await member?.roles.remove(reactionObject.roleId);
			await sendLog(
				{ emoji: emoji, guildId: guildId, roleId: roleId, isAdded: false, reactionUser: user },
				null,
				client
			);
		} catch (error) {
			console.error("Error when removing a reaction to a message:", error);
			await user.send({ content: "Une erreur s'est produite en tentant de vous retirer le rôle !" });
		}
	},
};
