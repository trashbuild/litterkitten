const sounds = require('../../kitten-sounds.js')
const { QueryType, useMainPlayer } = require('discord-player')
const {
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for tracks to play.')
    .addStringOption(option =>
      option.setName('terms')
        .setDescription('Search terms.')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply()

    // Get search terms
    if (interaction.args.length < 1) {
      return interaction.editReply({
        content: `${sounds.confused()} :musical_note:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Search
    const player = useMainPlayer()
    const name = interaction.args.join(' ')
    const searchResult = await player.search(name, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO
    })

    // Return if no results
    if (!searchResult || !searchResult.tracks.length) {
      return interaction.editReply({
        content: `${sounds.no()} :zero:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // // Get queue
    // const queue = await player.createQueue(interaction.guild, {
    //   leaveOnEnd: true,
    //   autoSelfDeaf: true
    // })

    // Create embed
    const maxTracks = searchResult.tracks.slice(0, 10)
    const embed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setDescription(
        `${maxTracks.map(
          (track, i) => `**${i + 1}**. ${track.title} | \`${track.author}\``)
          .join('\n')}\n\n :hash::grey_question:`
      )
      .setTimestamp()
      .setTitle(name)

    // Reply
    interaction.editReply({ embeds: [embed] })
      .catch(e => { console.log(e) })

    // Handle responses using a collector
    const collector = interaction.channel.createMessageCollector({
      time: 60000,
      errors: ['time'],
      filter: m => m.author.id === interaction.user.id
    })

    // On message...
    collector.on('collect', async (query) => {
      // Cancel
      if (query.content.toLowerCase() === 'cancel') {
        collector.stop()
        query.reply({
          content: `${sounds.yes()} :white_check_mark:`
        }).catch(e => { console.log(e) })
      }
      // Ignore invalid answers
      const value = parseInt(query.content)
      if (!value || value <= 0 || value > maxTracks.length) {
        query.reply({
          content: `${sounds.angy()} :hash::exclamation`
        }).catch(e => { console.log(e) })
      }
      // Confirm valid answer
      collector.stop()
      // Get queue
      try {
        if (!player.connection) {
          await player.connect(interaction.member.voice.channel)
        }
      } catch {
        await player.deleteQueue(interaction.guild.id)
        return query.reply({
          content: `${sounds.confused()} :microphone:`
        }).catch(e => { console.log(e) })
      }
      // Add track and play
      player.addTrack(searchResult.tracks[Number(query.content) - 1])
      if (!player.playing) await player.play()
    })

    // // On timeout, complain
    // collector.on('end', (msg, reason) => {
    //   if (reason === 'time') {
    //     return interaction.editReply({
    //       content: `${sounds.angy()} :alarm_clock:`,
    //       ephemeral: true
    //     }).catch(e => { console.log(e) })
    //   }
    // })
  }
}
