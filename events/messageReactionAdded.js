// Message Reaction Added
module.exports = {
	name: "messageReactionAdd",
	async execute(reaction, user, client) {
		if (user.bot) return;

		try {
			await reaction.fetch();

			const reactionsArray = client.reactions.get(reaction.message.id);

			if (!reactionsArray) return;

			const [reactionObject] = reactionsArray.value.filter((data) => data.emoji === reaction.emoji.name);

			if (!reactionObject) return;

			const guild = await client.guilds.fetch(reaction.message.guildId);
			const member = await guild?.members.fetch(user.id);

			await member?.roles.add(reactionObject.roleId);
		} catch (error) {
			console.error("Error when adding a reaction to a message:", error);
		}
	},
};
