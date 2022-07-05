const { Client, Intents, Permissions } = require("discord.js");
const { Collection, MessageActionRow } = require("discord.js");
const { token } = require("./config.json");
const path = require("path");
const fs = require("fs");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Reading command files
// @ts-ignore
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// @ts-ignore
	client.commands.set(command.data.name, command);
}

// Reading button files
// @ts-ignore
client.buttons = new Collection();
const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
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
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	if (!interaction.channel.permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES)) return;

	// @ts-ignore
	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, client);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Buttons
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;
	if (!interaction.channel.permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES)) return;

	// @ts-ignore
	const button = client.buttons.get(interaction.customId);

	if (!button) return;

	// Slash commands
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
		await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
	}
});


client.once('messageCreate', async message => {
	// Button Autorisation !!!
	const templateEmbed = {
		color: 0x1B1B1B,
		title: "Statut",
		fields: [
			{
				name: 'Délivré',
				value: 'Nous avons reçu votre demande\n\u200b',
			},
		],
		timestamp: new Date(),
		footer: {
			text: 'EPHEC - ISAT • FabLAB',
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
