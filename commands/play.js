const sounds = require('../kitten-sounds.js')
const { QueryType } = require('discord-player')
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')
// Fix "cannot play resource that has already ended"
const playdl = require('play-dl')

function makeButton(btn) {
  // Turn an {id, emoji} object into an actual button
  return new ButtonBuilder()
    .setCustomId(btn.id)
    .setEmoji(btn.emoji)
    .setStyle(ButtonStyle.Secondary)
}

function makeRow(row) {
  // Turn a list of {id, emoji} objects into a simple action row
  return new ActionRowBuilder().addComponents(row.map(makeButton))
}

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

    // Build control panel ---------------------------------------------------
    // Track info embed
    const embed = new EmbedBuilder()
      // .setColor()
      .setTitle('Music player')
      .setURL('https://github.com/trashbuild/litterkitten')
      // .setAuthor({ name: 'test', iconURL: ''})
      .setDescription('Test embed!')
      // .setThumbnail('test.png')
      .addFields(
        { name: 'test', value: 'test' }
      )
      // .setImage('test')
      .setTimestamp()
      .setFooter({ text: 'Footer text!' }) //, iconURL: 'test' })

    // Buttons
    const rows = [
      [
        { id: 'prev', emoji: '⏮️' },
        { id: 'play', emoji: '⏯️' },
        { id: 'stop', emoji: '⏹️' },
        { id: 'next', emoji: '⏭️' }
      ], [
        { id: 'repeat', emoji: '🔁' },
        { id: 'cool', emoji: '🆒' }
      ]
    ].map(makeRow)

    // Post music player to interaction channel
    const message = await interaction.editReply({
      embeds: [embed],
      components: rows,
      fetchReply: true
    })

    // Listen for button presses
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.ButtonBuilder
    })
    collector.on('collect', btn => {
      btn.deferUpdate()
      switch (btn.customId) {
        case 'prev':
          if (queue.previousTracks) queue.back()
          break
        case 'play':
          queue.setPaused(!queue.connection.paused)
          break
        case 'stop':
          queue.stop()
          break
        case 'next':
          queue.skip()
          break
        case 'repeat':
          queue.setRepeatMode((queue.repeatMode + 1 % 3))
          break
        // case 'cool':
        //   console.log('cool')
        default:
          console.log(btn.customId)
      }
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
