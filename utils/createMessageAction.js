const { ActionRowBuilder, Collection } = require("discord.js");

module.exports = {
	createMessageAction(client) {
		// Sort buttons by indice
		const msgActionRow = new ActionRowBuilder();
		// @ts-ignore
		[...client.buttons.values()]
			.sort((A, B) => A.indice - B.indice)
			.forEach((button) => msgActionRow.addComponents(button.data));

		// @ts-ignore
		client.messageAction = new Collection();
		// @ts-ignore
		client.messageAction.set("messageActionButton", msgActionRow);
	},
};
