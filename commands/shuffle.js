const sounds = require('../kitten-sounds.js')

module.exports = {
  description: 'Shuffles the playlist.',
  name: 'shuffle',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Get queue
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: `${sounds.confused()} :musical_note: :question:`,
        ephemeral: true
      }).catch(e => { })
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
    }).catch(e => { })
  }
}
