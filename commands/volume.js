const sounds = require('../kitten-sounds.js')

module.exports = {
  description: 'Adjust the music volume.',
  name: 'volume',
  options: [{
    name: 'volume',
    description: 'Volume, from 0 to 100.',
    type: 'INTEGER',
    required: true
  }],
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

    const vol = parseInt(interaction.args[0])
    if (!vol) {
      return interaction.reply({
        content: sounds.confused(),
        ephemeral: true
      }).catch(e => { })
    }

    if (queue.volume === vol) {
      return interaction.reply({
        content: sounds.no(),
        ephemeral: true
      }).catch(e => { })
    }

    if (vol < 0 || vol > 100) {
      return interaction.reply({
        content: sounds.confused(),
        ephemeral: true
      }).catch(e => { })
    }

    const success = queue.setVolume(vol)

    // Reply (or don't)
    if (interaction.silent) return
    return interaction.reply({
      content: success ? `${sounds.yes()} 🔊 **%${vol}**` : sounds.confused()
    }).catch(e => { })
  }
}
