import { Channel, ChannelType, MessageOptions } from "discord.js";
import { MyClient } from "../types/client";

function generateQuotedMessage(content: string | null) {
	if (content && !content?.startsWith("> ")) content = "> ".concat(content ?? "");

	return content?.replace(/\n/gm, "\n> ") ?? null;
}

function isCategory(channel: Channel | null) {
	if (channel?.type === ChannelType.DM) return false;
	if (channel?.type === ChannelType.GroupDM) return false;
	if (!channel?.parent) return true;

	return false;
}

async function sendMessage(channelId: string, message: MessageOptions | string, client: MyClient): Promise<void> {
	const channel = await client.channels.fetch(channelId);

	if (!channel || !channel.isTextBased()) return;

	await channel?.send(message);
}

function toTimestamp(date?: number | null) {
	if (!date) date = Date.now();

	return date.toString().substring(0, 10);
}

export { generateQuotedMessage, isCategory, sendMessage, toTimestamp };
