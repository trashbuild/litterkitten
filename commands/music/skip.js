const sounds = require('../../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current track.'),

  async execute(interaction) {
    // Get queue
    const node = useMainPlayer().nodes.get(interaction.guild.id).node
    if (!node || !node.isPlaying()) {
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Try to skip current song
    const success = node.skip()

    // Return whether it worked or not
    return interaction.reply({
      content: success
        ? `${sounds.yes()} :white_check_mark:`
        : `${sounds.confused()} :mute:`,
      ephemeral: true
    }).catch(e => { console.log(e) })
  }
}
