const {
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')
// const sounds = require('../kitten-sounds.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fox')
    .setDescription('???'),

  async execute(interaction) {
    await interaction.deferReply()
    const res = await fetch('https://randomfox.ca/floof/')
    const img = (await res.json()).image
    const embed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setImage(img)
      .setTitle(':fox:')
    interaction.editReply({ embeds: [embed] })
  }
}
