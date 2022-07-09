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
        content: `${sounds.confused()} :musical_note: :question:`,
        ephemeral: true
      }).catch(e => { })
    }
    const name = interaction.args[0]

    // Search
    const res = await client.player.search(name, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO
    })

    // Return if no results
    if (!res || !res.tracks.length) {
      return interaction.reply({
        content: `${sounds.no()} :x: :weary:`,
        ephemeral: true
      }).catch(e => { })
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
        `${maxTracks.map((track, i) => `**${i + 1}**. ${track.title} | \`${track.author}\``).join('\n')}\n\nChoose a song from **1** to **${maxTracks.length}** write send or write **cancel** and cancel selection.⬇️`
      ).setTimestamp()

    // Reply
    interaction.reply({ embeds: [embed] }).catch(e => { })

    // Handle responses
    const collector = interaction.channel.createMessageCollector({
      time: 15000,
      errors: ['time'],
      filter: m => m.author.id === interaction.user.id
    })
    collector.on('collect', async (query) => {
      if (query.content.toLowerCase() === 'cancel') {
        interaction.reply({
          content: ':x:',
          ephemeral: true
        }).catch(e => { })
        collector.stop()
      }

      const value = parseInt(query.content)
      if (!value || value <= 0 || value > maxTracks.length) {
        return interaction.reply({
          content: `Select **1** to **${maxTracks.length}** and write **send** or type **cancel**.`,
          ephemeral: true
        }).catch(e => { })
      }

      collector.stop()
      try {
        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel)
        }
      } catch {
        await client.player.deleteQueue(interaction.guild.id)
        return interaction.reply({
          content: `${sounds.confused()} :question: :microphone: :question:`,
          ephemeral: true
        }).catch(e => { })
      }

      await interaction.reply({
        content: 'Loading...'
      }).catch(e => { })

      queue.addTrack(res.tracks[Number(query.content) - 1])
      if (!queue.playing) await queue.play()
    })

    collector.on('end', (msg, reason) => {
      if (reason === 'time') {
        return interaction.reply({
          content: 'Search time expired',
          ephemeral: true
        }).catch(e => { })
      }
    })
  }
}
