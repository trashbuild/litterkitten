const {
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')
// const sounds = require('../kitten-sounds.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Meow!'),

  async execute(interaction) {
    await interaction.deferReply()
    const res = await fetch('https://api.thecatapi.com/v1/images/search', {
      headers: { 'x-api-key': interaction.client.config.cat_key }
    })
    const image = (await res.json())[0].url
    const embed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setImage(image)
      .setTitle(':cat:')
    interaction.editReply({ embeds: [embed] })
  }
}
