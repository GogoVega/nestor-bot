const { sendLog } = require("../utils/sendLog.js");

// Message Reaction Removed
module.exports = {
	name: "messageReactionRemove",
	async execute(reaction, user, client) {
		if (user.bot) return;

		try {
			await reaction.fetch();

			const reactionsObject = client.reactions.get(reaction.message.id);

			if (!reactionsObject) return;

			const [reactionObject] = reactionsObject.value.filter((data) => data.emoji === reaction.emoji.name);

			if (!reactionObject) return;

			const guild = await client.guilds.fetch(reaction.message.guildId);
			const member = await guild?.members.fetch(user.id);

			await member?.roles.remove(reactionObject.roleId);
			await sendLog(
				{ emoji: reactionObject.emoji, roleId: reactionObject.roleId, isAdded: false, reactionUser: user },
				null,
				client
			);
		} catch (error) {
			console.error("Error when removing a reaction to a message:", error);
			await user.send({ content: "Une erreur s'est produite en tentant de vous retirer le rôle !" });
		}
	},
};
