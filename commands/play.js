const sounds = require('../kitten-sounds.js')
const { QueryType } = require('discord-player')
const { SlashCommandBuilder } = require('discord.js')
const { buildEmbed, buildButtons } = require('../player.js')
// Fix "cannot play resource that has already ended"
const playdl = require('play-dl')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music.')
    .addStringOption(option =>
      option.setName('track')
        .setDescription('Track title or url')
        .setRequired(false)),

  async execute(interaction) {
    interaction.deferReply()
    const client = interaction.client

    // Get track(s) ----------------------------------------------------------
    // Search for provided terms
    const res = await client.player.search(
      interaction.args.join(' '),
      { requestedBy: interaction.member, searchEngine: QueryType.AUTO }
    )

    // Verify results
    if (!res || !res.tracks.length) {
      return interaction.editReply({
        content: `:zero: ${sounds.no()}`
      }).catch(e => { console.log(e) })
    }

    // Create queue for this guild (server)
    const queue = await client.player.createQueue(interaction.guild, {
      leaveOnEnd: true,
      autoSelfDeaf: true,
      metadata: interaction.channel,
      // Fix max volume on track start
      volumeSmoothness: false,
      // Fix "can't play resource that has already ended"
      async onBeforeCreateStream(track, source, _queue) {
        if (source === 'youtube') {
          return (
            await playdl.stream(
              track.url,
              { discordPlayerCompatibility: true }
            )).stream
        }
      }
    })

    // Establish/verify voice channel connection
    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel)
          .catch(e => { console.log(e) })
      }
    } catch {
      // Delete queue on failure
      await client.player.deleteQueue(interaction.guild.id)
      return interaction.editReply({
        content: `:x::desktop: ${sounds.angy()}`
      })
    }

    // Add track(s)
    res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0])

    // Post music player to interaction channel
    interaction.editReply({
      embeds: [buildEmbed(interaction)],
      components: buildButtons(interaction)
    })

    // Play (if not already playing)
    if (!queue.playing) queue.play()
  }
}

// async execute(interaction) {
//   await interaction.deferReply({ ephemeral: true })
//   const client = interaction.client

//   // Verify that channel is correct
//   // HACK: hardcoded #bot-spam
//   if (interaction.channel.id !== '416808433493344269') {
//     return interaction.editReply({
//       content: `:x::speech_balloon: ${sounds.angy()}`
//     }).catch(e => { console.log(e) })
//   }

//   // If no args given, just try to resume playback
//   if (interaction.args.length === 0) {
//     const queue = client.player.getQueue(interaction.guild.id)
//     if (queue && !queue.playing) {
//       await queue.play()
//       return interaction.editReply({
//         content: `:x::floppy_disc: ${sounds.confused()}`
//       }).catch(e => { console.log(e) })
//     }
//   }

//   // If args given, search for those terms
//   const res = await client.player.search(
//     interaction.args.join(' '),
//     { requestedBy: interaction.member, searchEngine: QueryType.AUTO }
//   )

//   // Verify music info
//   if (!res || !res.tracks.length) {
//     return interaction.editReply({
//       content: `:zero: ${sounds.no()}`
//     }).catch(e => { console.log(e) })
//   }

//   // Create queue for this guild (server)
//   const queue = await client.player.createQueue(interaction.guild, {
//     leaveOnEnd: true,
//     autoSelfDeaf: true,
//     metadata: interaction.channel,
//     // Fix max volume on track start
//     volumeSmoothness: false,
//     // Fix "can't play resource that has already ended"
//     async onBeforeCreateStream(track, source, _queue) {
//       if (source === 'youtube') {
//         return (
//           await playdl.stream(
//             track.url,
//             { discordPlayerCompatibility: true }
//           )).stream
//       }
//     }
//   })

//   // Establish/verify voice channel connection
//   try {
//     if (!queue.connection) {
//       await queue.connect(interaction.member.voice.channel)
//         .catch(e => { console.log(e) })
//     }
//   } catch {
//     // Delete queue on failure
//     await client.player.deleteQueue(interaction.guild.id)
//     return interaction.editReply({
//       content: `${sounds.angy()} :desktop:`
//     })
//   }

//   // Add track(s)
//   res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0])
//   // Play (if not already playing)
//   if (!queue.playing) await queue.play()
//   // Report success
//   if (queue.playing) {
//     interaction.editReply({
//       content: `:white_check_mark: ${sounds.yes()}`,
//       ephemeral: false
//     })
//   }
// }
