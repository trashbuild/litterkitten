const sounds = require('../kitten-sounds.js')
const { QueryType } = require('discord-player')
const { ApplicationCommandOptionType } = require('discord.js')
// Fix "cannot play resource that has already ended"
const playdl = require('play-dl')

module.exports = {
  name: 'play',
  type: 1,
  description: 'Play music.',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'music',
    description: 'Music title / link',
    required: true
  }],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Verify that channel is correct
    if (interaction.channel.id !== '416808433493344269') {
      return interaction.reply({
        content: `${sounds.angy()} :x:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // If no args given, just try to resume playback
    if (interaction.args.length === 0) {
      const queue = client.player.getQueue(interaction.guild.id)
      if (queue && !queue.playing) {
        await queue.play()
        return interaction.reply({
          content: `${sounds.confused()} :floppy_disc:`,
          ephemeral: true
        }).catch(e => { console.log(e) })
      }
    }

    // If args given, search for those terms
    const music = interaction.args.join(' ')
    const res = await client.player.search(music, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO
    })

    // Verify music info
    if (!res || !res.tracks.length) {
      return interaction.reply({
        content: `${sounds.no()} :weary:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Send "working" message
    await interaction.reply({
      content: sounds.working(),
      ephemeral: true
    })

    // Create/receive queue
    const queue = await client.player.createQueue(interaction.guild, {
      leaveOnEnd: true,
      autoSelfDeaf: true,
      metadata: interaction.channel,
      // Fix max volume on track start
      volumeSmoothness: false,
      // Fix "can't play resource that has already ended"
      async onBeforeCreateStream(track, source, _queue) {
        if (source === 'youtube') {
          return (await playdl.stream(track.url, { discordPlayerCompatibility: true })).stream
        }
      }
    })

    // Establish/verify connection
    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel)
          .catch(e => { console.log(e) })
      }
    } catch {
      await client.player.deleteQueue(interaction.guild.id)
      return interaction.editReply({
        content: `${sounds.angy()} :desktop:`,
        ephemeral: true
      })
    }

    // Add track(s) and play
    res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0])
    if (!queue.playing) await queue.play()
    if (queue.playing) {
      interaction.editReply(`${sounds.yes()}:white_check_mark`)
    }
  }
}
