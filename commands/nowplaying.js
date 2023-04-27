const sounds = require('../kitten-sounds.js')
const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')
const { useMasterPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show current track info.'),

  async execute(interaction) {
    // Verify that a song is playing
    const player = useMasterPlayer()
    const queue = player.nodes.get(interaction.guild.id)
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Create embed
    const client = interaction.client
    const track = queue.currentTrack
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
