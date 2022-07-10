const sounds = require('../kitten-sounds.js')

module.exports = {
  description: 'Can\'t, won\'t.',
  name: 'stop',
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

    // Destroy the queue
    queue.destroy()

    // Reply
    interaction.reply({
      content: `${sounds.yes()} :white_check_mark:`,
      ephemeral: true
    }).catch(e => { console.log(e) })
  }
}
