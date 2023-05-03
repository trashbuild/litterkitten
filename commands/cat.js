const discord = require('discord.js')
// const sounds = require('../kitten-sounds.js')

module.exports = {
    data: new discord.SlashCommandBuilder()
      .setName('cat')
      .setDescription(':cat:'),

    async execute(interaction) {
      await interaction.deferReply()
      const res = await fetch('https://api.thecatapi.com/v1/images/search', {
        headers: {'x-api-key': interaction.client.config.cat_key}
      })
      const data = (await res.json())[0]    // always gives a list
      const embed = new discord.EmbedBuilder()
        .setTitle(':cat:')
        .setImage(data.url)
        .setColor(interaction.client.config.color)
      interaction.editReply({ embeds: [embed] })
    }
}