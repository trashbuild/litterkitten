const sounds = require('../kitten-sounds.js')
const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder
} = require('discord.js')

module.exports = {
  name: 'nowplaying',
  type: 1,
  description: 'Current track info.',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Verify that a song is playing
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Create embed
    const track = queue.current
    const timestamp = queue.getPlayerTimestamp()
    const embed = new EmbedBuilder()
      .setColor(client.config.color)
      .setThumbnail(track.thumbnail)
      .setTitle(track.title)
      .setDescription(
        `:speaker: %${queue.volume}
        :timer: ${timestamp.progress === 'Forever'
          ? ':infinity:'
          : track.duration}
        :link: [direct link](${track.url})
        :question: ${track.requestedBy}`)
      .setTimestamp()

    // Create save button
    const saveButton = new ButtonBuilder()
      .setLabel('Save Song')
      .setCustomId('saveTrack')
      .setStyle('SUCCESS')
    const row = new ActionRowBuilder().addComponents(saveButton)

    // Send reply
    interaction.reply({ embeds: [embed], components: [row] })
      .catch(e => { console.log(e) })
  }
}
