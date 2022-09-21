const sounds = require('../kitten-sounds.js')

module.exports = {
  name: 'skip',
  type: 1,
  description: 'Switches the music being played.',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Get queue
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
