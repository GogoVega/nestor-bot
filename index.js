const { Client, Collection, Intents, MessageActionRow, Permissions } = require("discord.js");
const { channelId, token, webhookId } = require("./config.json");
const path = require("path");
const fs = require("fs");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Reading commands from files
// @ts-ignore
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// @ts-ignore
	client.commands.set(command.data.name, command);
}

// Reading buttons from files
// @ts-ignore
client.buttons = new Collection();
const buttonsPath = path.join(__dirname, "buttons");
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith(".js"));
let msgActionRow = new MessageActionRow();
let buttonsRow = [];

for (const file of buttonFiles) {
	const filePath = path.join(buttonsPath, file);
	const button = require(filePath);

	// @ts-ignore
	client.buttons.set(button.data.customId, button);
	buttonsRow.push(button);
}

// Sort buttons by indice
buttonsRow.sort((A, B) => A.indice - B.indice);
buttonsRow.forEach((button) => msgActionRow.addComponents(button.data));

// Events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Command interaction
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;
	// @ts-ignore
	if (!interaction.channel.permissionsFor(client.user).has(Permissions.FLAGS.USE_APPLICATION_COMMANDS)) return;

	// @ts-ignore
	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, client);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
	}
});

// Button interraction
client.on("interactionCreate", async interaction => {
	if (!interaction.isButton()) return;
	// @ts-ignore
	if (!interaction.channel.permissionsFor(client.user).has(Permissions.FLAGS.ADD_REACTIONS)) return;
	//if (!interaction.member.roles.cache.has(roleId)) return;

	// @ts-ignore
	const button = client.buttons.get(interaction.customId);

	if (!button) return;

	// Slash commands
	// Fields.name of command execute command-fablab
	const NotAllowed = ["Description", "Temps d'impression", "Temps restant d'impression"];
	const fields = interaction.message.embeds[0].fields;
	let fieldsFiltered = [];

	if (fields)
		fieldsFiltered = fields.filter((field) => !NotAllowed.includes(field.name));

	const lastFieldName = fieldsFiltered.pop().name;

	try {
		await button.execute(interaction, lastFieldName);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: "There was an error while executing this button!", ephemeral: true });
	}
});

// Reply to a received message
client.on("messageCreate", async message => {
	//message.webhookId
	if (message.author.id !== webhookId || message.channelId !== channelId || message.author.bot)
		return;
	//if (!message.channel.permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES)) return;
	// @ts-ignore
	console.log(message.channel.permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES));

	const templateEmbed = {
		color: 0x1B1B1B,
		title: "Statut",
		fields: [
			{
				name: "Délivré",
				value: "Nous avons reçu votre demande\n\u200b",
			},
		],
		timestamp: new Date(),
		footer: {
			text: "EPHEC - ISAT • FabLAB",
			// @ts-ignore
			icon_url: client.user.avatarURL(),
		},
	};

	try {
		// @ts-ignore
		await message.reply({ embeds: [templateEmbed], components: [msgActionRow] });
	}
	catch (error) { console.error(error) }
});

client.login(token);
