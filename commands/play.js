const sounds = require('../kitten-sounds.js')
const { QueryType } = require('discord-player')

module.exports = {
  description: 'Play music.',
  name: 'play',
  options: [{
    description: 'Music title / link',
    name: 'music',
    type: 'STRING',
    required: true
  }],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Verify that some info was provided
    if (interaction.args.length < 1) {
      return interaction.reply({
        content: `${sounds.confusion()} :floppy_disc: :question:`,
        ephemeral: true
      }).catch(e => { })
    }

    // Find music
    const music = interaction.args[0]
    const res = await client.player.search(music, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO
    })

    // Verify music info
    if (!res || !res.tracks.length) {
      return interaction.reply({
        content: `${sounds.no()} :x: :weary:`,
        ephemeral: true
      }).catch(e => { })
    }

    // Create/receive queue
    const queue = await client.player.createQueue(interaction.guild, {
      leaveOnEnd: true,
      autoSelfDeaf: true,
      metadata: interaction.channel
    })

    // Send "working" message
    await interaction.channel.send({
      content: sounds.working()
    })

    // Establish/verify connection
    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel)
      }
    } catch {
      await client.player.deleteQueue(interaction.guild.id)
      return interaction.reply({
        content: `${sounds.angy()} :x: :desktop:`,
        ephemeral: true
      })
    }

    // Add track(s) and play
    res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0])
    if (!queue.playing) await queue.play()
  }
}
