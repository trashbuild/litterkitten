const sounds = require('../kitten-sounds.js')
const { MessageEmbed } = require('discord.js')
const { QueryType } = require('discord-player')

module.exports = {
  description: 'Find music.',
  name: 'search',
  options: [{
    name: 'name',
    description: 'Search terms.',
    type: 'STRING',
    required: true
  }],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Get search terms
    if (interaction.args.length < 1) {
      return interaction.reply({
        content: `${sounds.confused()} :musical_note:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }
    const name = interaction.args.join(' ')

    // Search
    const res = await client.player.search(name, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO
    })

    // Return if no results
    if (!res || !res.tracks.length) {
      return interaction.reply({
        content: `${sounds.no()} :zero:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Get queue
    const queue = await client.player.createQueue(interaction.guild, {
      leaveOnEnd: true,
      autoSelfDeaf: true,
      metadata: interaction.channel
    })

    // Create embed
    const maxTracks = res.tracks.slice(0, 10)
    const embed = new MessageEmbed()
      .setColor(client.config.color)
      .setTitle(name)
      .setDescription(
        `${maxTracks.map(
          (track, i) => `**${i + 1}**. ${track.title} | \`${track.author}\``)
          .join('\n')}\n\n :hash::grey_question:`
      ).setTimestamp()

    // Reply
    interaction.reply({ embeds: [embed] })
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
        interaction.reply({
          content: `${sounds.yes()} :x:`,
          ephemeral: true
        }).catch(e => { console.log(e) })
        collector.stop()
      }
      // Ignore invalid answers
      const value = parseInt(query.content)
      if (!value || value <= 0 || value > maxTracks.length) return
      // Confirm valid answer
      collector.stop()
      await interaction.reply({
        content: sounds.working()
      }).catch(e => { console.log(e) })
      // Get queue
      try {
        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel)
        }
      } catch {
        await client.player.deleteQueue(interaction.guild.id)
        return interaction.reply({
          content: `${sounds.confused()} :microphone:`,
          ephemeral: true
        }).catch(e => { console.log(e) })
      }
      // Add track and play
      queue.addTrack(res.tracks[Number(query.content) - 1])
      if (!queue.playing) await queue.play()
    })

    // On timeout, complain
    collector.on('end', (msg, reason) => {
      if (reason === 'time') {
        return interaction.reply({
          content: `${sounds.angy()} :alarm_clock:`,
          ephemeral: true
        }).catch(e => { console.log(e) })
      }
    })
  }
}
