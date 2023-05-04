const discord = require('discord.js')
// const sounds = require('../kitten-sounds.js')

module.exports = {
    data: new discord.SlashCommandBuilder()
      .setName('dog')
      .setDescription('Woof!'),

    async execute(interaction) {
      await interaction.deferReply()
      const res = await fetch('https://dog.ceo/api/breeds/image/random')
      const img = (await res.json()).message
      const embed = new discord.EmbedBuilder()
        .setTitle(':dog:')
        .setImage(img)
        .setColor(interaction.client.config.color)
      interaction.editReply({ embeds: [embed] })
    }
}