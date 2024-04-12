const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set playback volume.')
    .addIntegerOption(option =>
      option.setName('volume')
        .setDescription('Volume')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)),

  async execute(interaction) {
    // Get queue
    const player = useMainPlayer()
    const queue = player.nodes.get(interaction.guild.id)
    if (!queue || !queue.node.isPlaying()) {
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
    // console.log(`Setting volume to ${vol}...`)
    const success = queue.node.setVolume(vol)

    // Reply
    if (interaction.silent) return
    return interaction.reply({
      content: success
        ? `${sounds.yes()} 🔊 **%${vol}**`
        : `${sounds.confused()} :mute:`
    }).catch(e => { console.log(e) })
  }
}
