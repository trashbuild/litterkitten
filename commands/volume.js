const { ApplicationCommandOptionType } = require('discord.js')
const sounds = require('../kitten-sounds.js')

module.exports = {
  name: 'volume',
  type: 1,
  description: 'Adjust the music volume.',
  options: [{
    type: ApplicationCommandOptionType.Integer,
    name: 'volume',
    description: 'Volume, from 0 to 100.',
    required: true
  }],
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

    // Verify new volume
    const vol = parseInt(interaction.args[0])
    if (!vol || vol < 0 || vol > 100) {
      return interaction.reply({
        content: `${sounds.confused()} :hash:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }
    if (queue.volume === vol) return

    // Try to set volume
    const success = queue.setVolume(vol)

    // Reply
    if (interaction.silent) return
    return interaction.reply({
      content: success
        ? `${sounds.yes()} 🔊 **%${vol}**`
        : `${sounds.confused()} :mute:`
    }).catch(e => { console.log(e) })
  }
}
