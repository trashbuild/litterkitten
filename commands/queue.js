const sounds = require('../kitten-sounds.js')
const {
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the current playlist.'),

  async execute(interaction) {
    // Get queue
    const queue = useMainPlayer().nodes.get(interaction.guild.id)
    if (!queue || !queue.node.isPlaying()) {
      return interaction.reply({
        content: `${sounds.confused()} :mute:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Return if no music
    if (!queue.tracks.size) {
      return interaction.reply({
        content: `${sounds.no()} :zero:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Create embed
    const tracks = queue.tracks.map(
      (track, i) => `**${i + 1}** - ${track.title} | ${track.author}`
    )
    const n = queue.tracks.size
    const nextSongs = n > 5 ? `+ **${n - 5}**` : `**${n}**`
    const embed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setDescription(
        `Currently Playing: \`${queue.currentTrack.title}\`\n
        ${tracks.slice(0, 5).join('\n')}\n\n${nextSongs}`
      )
      .setThumbnail(queue.currentTrack.thumbnail)
      .setTimestamp()
      .setTitle('Playlist')

    // Reply
    interaction.reply({ embeds: [embed] })
      .catch(e => { console.log(e) })
  }
}
