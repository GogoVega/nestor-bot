import { Channel, ChannelType, EmbedBuilder } from "discord.js";
import { MyClient } from "../types/client";

function checkContentMessage(content: string | null) {
	return content?.replace(/\n/gm, "\n> ");
}

function isCategory(channel: Channel | null) {
	if (channel?.type === ChannelType.DM) return false;
	if (channel?.type === ChannelType.GroupDM) return false;
	if (!channel?.parent) return true;

	return false;
}

async function sendMessage(channelId: string, message: EmbedBuilder, client: MyClient): Promise<void> {
	const channel = await client.channels.fetch(channelId);

	if (!channel || !channel.isTextBased()) return;

	await channel?.send({ embeds: [message] });
}

function toTimestamp(date?: number | null) {
	if (!date) date = Date.now();

	return date.toString().substring(0, 10);
}

export { checkContentMessage, isCategory, sendMessage, toTimestamp };
