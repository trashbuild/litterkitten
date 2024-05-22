const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause music without closing the player.'),

  async execute(interaction) {
    // Get node
    const node = useMainPlayer().queues.get(interaction.guild.id).node
    if (!node) {
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Toggle pause state
    const success = node.setPaused(!node.isPaused())

    // Return whether based on success
    return interaction.reply({
      content: success
        ? `${sounds.yes()} :white_check_mark:`
        : `${sounds.confused()} :mute:`,
      ephemeral: true
    }).catch(e => { console.log(e) })
  }
}
