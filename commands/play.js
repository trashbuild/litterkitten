const { QueryType } = require('discord-player')
const sounds = require('../kitten-sounds.js')

module.exports = {
  description: 'It helps you start a new music.',
  name: 'play',
  options: [{
    description: 'Type the name of the music you want to play.',
    name: 'music',
    type: 'STRING',
    required: true
  }],
  voiceChannel: true,

  run: async (client, interaction) => {
    console.log(interaction)

    if (interaction.args.length < 1) {
      return interaction.reply({
        content: sounds.confusion(),
        ephemeral: true
      }).catch(e => { })
    }
    const music = interaction.args[0]

    const res = await client.player.search(music, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO
    })

    if (!res || !res.tracks.length) {
      return interaction.reply({
        content: 'No results found! ❌',
        ephemeral: true
      }).catch(e => { })
    }

    const queue = await client.player.createQueue(interaction.guild, {
      leaveOnEnd: true,
      autoSelfDeaf: true,
      metadata: interaction.channel
    })

    await interaction.channel.send({
      content: `Your ${res.playlist ? 'Playlist' : 'Track'} Loading... 🎧`
    })

    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel)
      }
    } catch {
      await client.player.deleteQueue(interaction.guild.id)
      return interaction.reply({
        content: 'I can\'t join audio channel. ❌',
        ephemeral: true
      })
    }

    res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0])
    if (!queue.playing) await queue.play()
  }
}
