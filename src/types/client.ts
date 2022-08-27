import { ActionRowBuilder, ButtonBuilder, Client, Collection } from "discord.js";
import { Button, Command, Configurations, Modals, Reactions } from "./collection";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface MyClient extends Client {
	[key: string]: any;
	buttons: Collection<string, Button>;
	commands: Collection<string, Command>;
	configurations: Collection<string, Configurations>;
	messageAction: Collection<string, ActionRowBuilder<ButtonBuilder>>;
	modals: Collection<string, Modals>;
	reactions: Collection<string, Reactions>;
}
