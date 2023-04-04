const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMasterPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music playback.'),

  async execute(interaction) {
    // Get queue
    const client = interaction.client
    const player = useMasterPlayer()
    const queue = player.nodes.get(interaction.guild.id)
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Destroy the queue
    queue.delete()

    // Reply
    interaction.reply({
      content: `${sounds.yes()} :white_check_mark:`
    }).catch(e => { console.log(e) })
  }
}
