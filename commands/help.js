const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Replies with all available commands and their usage."),
  async execute(interaction, client) {
    const userAvatar = client.user.avatarURL();
    const templateEmbed = new MessageEmbed()
      .setColor("BLUE")
      .setTitle("Available Commands")
      .setTimestamp()
      .setFooter({ text: "EPHEC - ISAT • FabLAB", iconURL: `${userAvatar}` });

    client.commands.forEach((command) => templateEmbed.addField(command.data.name, command.data.description));
    return await interaction.reply({ embeds: [templateEmbed] });
  }
};