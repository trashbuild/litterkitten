const sounds = require('../kitten-sounds.js')

const maxVol = 100

module.exports = {
  description: 'Adjust the music volume.',
  name: 'volume',
  options: [{
    name: 'volume',
    description: `Volume, from 0 to ${maxVol}.`,
    type: 'INTEGER',
    required: true
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue || !queue.playing || interaction.args.length < 1) {
      return interaction.reply({
        content: sounds.angy(),
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

    if (vol < 0 || vol > maxVol) {
      return interaction.reply({
        content: sounds.confused(),
        ephemeral: true
      }).catch(e => { })
    }

    const success = queue.setVolume(vol)
    return interaction.reply({
      content: success ? `Volume changed: **%${vol}**/**${maxVol}** 🔊` : 'Something went wrong. ❌'
    }).catch(e => { })
  }
}
