const { keys } = require('../../config.json')
const {
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bird')
    .setDescription('Chirp!'),

  async execute(interaction) {
    await interaction.deferReply()
    const url = 'https://api.unsplash.com/photos/random?' +
      new URLSearchParams({ query: 'bird' }).toString()
    fetch(url, { headers: { Authorization: 'Client-ID ' + keys.unsplash } })
      .then((response) => response.json())
      .then((data) => {
        const embed = new EmbedBuilder()
          .setColor(interaction.guild.members.me.displayHexColor)
          .setDescription(data.description)
          .setImage(data.urls.small)
          .setTitle(':bird:')
        interaction.editReply({ embeds: [embed] })
      })
  }
}
