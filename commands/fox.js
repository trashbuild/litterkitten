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
      .setTitle(':fox:')
      .setImage(img)
      .setColor(interaction.client.config.color)
    interaction.editReply({ embeds: [embed] })
  }
}
