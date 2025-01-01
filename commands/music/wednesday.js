const { SlashCommandBuilder } = require('discord.js')
const { wednesday } = require('../../config.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wednesday')
    .setDescription('For when it is Wednesday.'),

  async execute(interaction) {
    // Load Wednesday playlist from config file
    const client = interaction.client
    interaction.args = [wednesday]
    // Play and shuffle
    await client.commands.get('play').execute(interaction)
    interaction.silent = true
    await client.commands.get('shuffle').execute(interaction)
  }
}
