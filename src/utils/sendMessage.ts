import { EmbedBuilder } from "discord.js";
import { MyClient } from "../types/client";

async function sendMessage(channelId: string, message: EmbedBuilder, client: MyClient): Promise<void> {
	const channel = await client.channels.fetch(channelId);

	if (!channel || !channel.isTextBased()) return;

	await channel?.send({ embeds: [message] });
}

function checkContentMessage(content: string | null) {
	return content?.replace(/\n/gm, "\n> ");
}

export { checkContentMessage, sendMessage };
