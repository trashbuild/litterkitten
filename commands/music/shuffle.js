const sounds = require('../../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current playlist.'),

  async execute(interaction) {
    // Get queue
    const player = useMainPlayer()
    const queue = player.nodes.get(interaction.guild.id)
    if (!queue || !queue.tracks) {
      if (interaction.silent) return
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Shuffle
    await queue.tracks.shuffle()

    // Reply (or don't)
    if (interaction.silent) return
    return interaction.reply({
      content: `${sounds.yes()} :white_check_mark:`,
      ephemeral: true
    }).catch(e => { console.log(e) })
  }
}
