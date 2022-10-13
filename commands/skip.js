const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current track.'),

  async execute(interaction) {
    // Get queue
    const client = interaction.client
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Try to skip current song
    const success = queue.skip()

    // Return whether it worked or not
    return interaction.reply({
      content: success
        ? `${sounds.yes()} :white_check_mark:`
        : `${sounds.confused()} :mute:`,
      ephemeral: true
    }).catch(e => { console.log(e) })
  }
}
