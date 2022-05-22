const sounds = require('../kitten-sounds.js')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
  description: 'Current track info.',
  name: 'nowplaying',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Verify that a song is playing
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: `${sounds.confused()} :question: :musical_note: :question:`,
        ephemeral: true
      }).catch(e => { })
    }

    // Create embed
    const track = queue.current
    const timestamp = queue.getPlayerTimestamp()
    const embed = new MessageEmbed()
      .setColor('BLUE')
      .setThumbnail(track.thumbnail)
      .setTitle(track.title)
      .addField(':speaker:', `%${queue.volume}`)
      .addField(':timer:', `${timestamp.progress === 'Forever' ? ':infinity:' : track.duration}`)
      .addField(':link:', `${track.url}`)
      .addField(':question:', `${track.requestedBy}`)
      .setTimestamp()

    // Create save button
    const saveButton = new MessageButton()
      .setLabel('Save Song')
      .setCustomId('saveTrack')
      .setStyle('SUCCESS')
    const row = new MessageActionRow().addComponents(saveButton)

    // Send reply
    interaction.reply({ embeds: [embed], components: [row] }).catch(e => { })
  }
}
