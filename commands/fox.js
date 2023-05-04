const discord = require('discord.js')
// const sounds = require('../kitten-sounds.js')

module.exports = {
    data: new discord.SlashCommandBuilder()
      .setName('fox')
      .setDescription(':fox:'),

    async execute(interaction) {
      await interaction.deferReply()
      const res = await fetch('https://randomfox.ca/floof/')
      const img = (await res.json()).image
      const embed = new discord.EmbedBuilder()
        .setTitle(':fox:')
        .setImage(img)
        .setColor(interaction.client.config.color)
      interaction.editReply({ embeds: [embed] })
    }
}