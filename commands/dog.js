const {
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')
// const sounds = require('../kitten-sounds.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Woof!'),

  async execute(interaction) {
    await interaction.deferReply()
    const res = await fetch('https://dog.ceo/api/breeds/image/random')
    const img = (await res.json()).message
    const embed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setImage(img)
      .setTitle(':dog:')
    interaction.editReply({ embeds: [embed] })
  }
}
