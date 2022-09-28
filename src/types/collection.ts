import {
	Attachment,
	ButtonBuilder,
	ButtonInteraction,
	ChatInputCommandInteraction,
	ClientEvents,
	Guild,
	GuildMember,
	Interaction,
	InteractionResponse,
	Message,
	MessageReaction,
	ModalBuilder,
	ModalSubmitInteraction,
	PartialGuildMember,
	PartialMessage,
	PartialMessageReaction,
	PartialUser,
	PermissionResolvable,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	User,
} from "discord.js";
import { MyClient } from "./client";

export const dataPaths: Record<string, string> = {
	configurations: "configurations.json",
	reactions: "reactions.json",
};

export const defaultConfigurations: Configuration = {
	channels: [],
	interaction: {
		channelId: "",
		button: false,
		command: false,
		reaction: false,
	},
	member: {
		channelId: "",
		add: false,
		remove: false,
	},
	message: {
		channelId: "",
		channelsId: [],
		delete: false,
		update: false,
	},
};

export interface Button {
	indice: number;
	data: ButtonBuilder;
	execute(interaction: ButtonInteraction, lastFieldName: string): Promise<InteractionResponse<boolean> | undefined>;
}

export interface Command {
	basePermission?: PermissionResolvable;
	data: SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	managePermission?: boolean;
	execute(
		interaction: ChatInputCommandInteraction,
		client: MyClient
	): Promise<void | InteractionResponse<boolean> | undefined>;
}

type InteractionConfiguration = {
	channelId: string;
	button: boolean;
	command: boolean;
	reaction: boolean;
};

type MemberConfiguration = {
	channelId: string;
	add: boolean;
	remove: boolean;
};

type MessageConfiguration = {
	channelId: string;
	channelsId: string[];
	delete: boolean;
	update: boolean;
};

export type Configuration = {
	channels: string[];
	interaction: InteractionConfiguration;
	member: MemberConfiguration;
	message: MessageConfiguration;
};

export type ConfigurationsFile = Record<string, Configuration>;
export type ConfigurationsProperty = InteractionConfiguration & MemberConfiguration & MessageConfiguration;

export interface Modal {
	channelId?: string;
	messageId?: string;
	author?: string | null;
	color?: number | null;
	timestamp?: boolean | null;
	image?: Attachment | null;
	iconURL?: string | null;
	iconImage?: Attachment | null;
	thumbnail?: Attachment | null;
	data: ModalBuilder;
	execute(
		interaction: ModalSubmitInteraction,
		client: MyClient
	): Promise<void | InteractionResponse<boolean> | undefined>;
}

interface ReactionType {
	channel: string;
	values: Array<{ emoji: string; roleId: string[] }>;
}

export type Reaction = Record<string, ReactionType>;

export type ReactionsFile = Record<string, Reaction>;

export type Data = ReactionsFile | ConfigurationsFile;

interface BaseEvent {
	name: keyof ClientEvents;
	once?: boolean;
}

export interface InteractionEvent extends BaseEvent {
	execute(interaction: Interaction, client: MyClient): Promise<void | InteractionResponse<boolean> | undefined>;
}

export interface GuildEvent extends BaseEvent {
	execute(guild: Guild, client: MyClient): Promise<void>;
}

export interface MemberAddEvent extends BaseEvent {
	execute(member: GuildMember, client: MyClient): Promise<void>;
}

export interface MemberRemoveEvent extends BaseEvent {
	execute(member: GuildMember | PartialGuildMember, client: MyClient): Promise<void>;
}

export interface ClientEvent extends BaseEvent {
	execute(client: MyClient): void;
}

export interface MessageCreateEvent extends BaseEvent {
	execute(message: Message, client: MyClient): Promise<void>;
}

export interface MessageDeleteEvent extends BaseEvent {
	execute(message: Message | PartialMessage, client: MyClient): Promise<void>;
}

export interface MessageUpdateEvent extends BaseEvent {
	execute(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage, client: MyClient): Promise<void>;
}

export interface ReactionEvent extends BaseEvent {
	execute(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser,
		client: MyClient
	): Promise<void>;
}

export interface UserEvent extends BaseEvent {
	execute(user: User, client: MyClient): Promise<void>;
}

type TupleEntry<T extends readonly unknown[], I extends unknown[] = [], R = never> = T extends readonly [
	infer Head,
	...infer Tail
]
	? TupleEntry<Tail, [...I, unknown], R | [`${I["length"]}`, Head]>
	: R;

// eslint-disable-next-line @typescript-eslint/ban-types
type ObjectEntry<T extends {}> =
	// eslint-disable-next-line @typescript-eslint/ban-types
	T extends object
		? { [K in keyof T]: [K, Required<T>[K]] }[keyof T] extends infer E
			? E extends [infer K, infer V]
				? K extends string | number
					? [`${K}`, V]
					: never
				: never
			: never
		: never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Entry<T extends {}> = T extends readonly [unknown, ...unknown[]]
	? TupleEntry<T>
	: T extends ReadonlyArray<infer U>
	? [`${number}`, U]
	: ObjectEntry<T>;

// eslint-disable-next-line @typescript-eslint/ban-types
export function typedEntries<T extends {}>(object: T): ReadonlyArray<Entry<T>> {
	return Object.entries(object) as unknown as ReadonlyArray<Entry<T>>;
}
