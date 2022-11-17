const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music playback.'),

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

    // Destroy the queue
    queue.destroy()

    // Reply
    interaction.reply({
      content: `${sounds.yes()} :white_check_mark:`
    }).catch(e => { console.log(e) })
  }
}
