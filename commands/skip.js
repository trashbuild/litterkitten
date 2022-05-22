const sounds = require('../kitten-sounds.js')

module.exports = {
  description: 'Switches the music being played.',
  name: 'skip',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Get queue
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: `${sounds.confused()} :question: :musical_note: :question:`,
        ephemeral: true
      }).catch(e => { })
    }

    const success = queue.skip()

    return interaction.reply({
      content: success ? `${sounds.yes()} :white_check_mark:` : `${sounds.confused()}`,
      ephemeral: true
    }).catch(e => { })
  }
}
