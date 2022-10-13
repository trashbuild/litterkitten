const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wednesday')
    .setDescription('For when it is Wednesday.'),

  async execute(interaction) {
    // Load Wednesday playlist from config file
    const client = interaction.client
    interaction.args = [client.config.wednesday]
    // Play, then shuffle and set volume after timeout
    client.commands.get('play').execute(interaction)
      .then(setTimeout(() => {
        interaction.silent = true
        client.commands.get('shuffle').execute(interaction)
        interaction.args = [25]
        client.commands.get('volume').execute(interaction)
      }, 6000))
  }
}
