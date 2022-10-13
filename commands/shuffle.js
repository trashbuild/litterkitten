const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current playlist.'),

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

    // Shuffle
    const tracks = queue.tracks
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]]
    }

    // Reply (or don't)
    if (interaction.silent) return
    return interaction.reply({
      content: `${sounds.yes()} :white_check_mark:`,
      ephemeral: true
    }).catch(e => { console.log(e) })
  }
}
