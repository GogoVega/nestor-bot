import { ActionRowBuilder, ButtonBuilder, Collection } from "discord.js";
import { MyClient } from "../types/client";

// Sort buttons by indice
export function createMessageAction(client: MyClient) {
	const msgActionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

	[...client.buttons.values()]
		.sort((A, B) => A.indice - B.indice)
		.forEach((button) => msgActionRow.addComponents(button.data));

	client.messageAction = new Collection();
	client.messageAction.set("messageActionButton", msgActionRow);
}
