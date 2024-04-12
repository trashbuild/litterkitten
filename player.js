const {
  ActionRowBuilder,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js')
const { Player } = require('discord-player')

function initPlayer(client) {
  // Build the music player
  const player = Player.singleton(client)
  player.extractors.loadDefault()

  // Event handling
  player.on('audioTrackAdd', (queue, track) => {
    queue.metadata.send({
      content: `:white_check_mark: ${track.title}`
    }).catch(e => { console.log(e) })
    console.log(`Added: ${track.title}`)
  })

  player.on('audioTracksAdd', (queue, tracks) => {
    queue.metadata.send({
      content: `:white_check_mark: ${tracks.length} :music_note:`
    }).catch(e => { console.log(e) })
    console.log(`Added: ${tracks.length} tracks`)
  })

  player.on('audioTrackRemove', (queue, track) => {
    queue.metadata.send({
      content: `:x: ${track.title}`
    }).catch(e => { console.log(e) })
    console.log(`Removed: ${track.title}`)
  })

  player.on('audioTracksRemove', (queue, tracks) => {
    queue.metadata.send({
      content: `:x: ${tracks.length} :music_note:`
    }).catch(e => { console.log(e) })
    console.log(`Removed: ${tracks.length} tracks`)
  })

  player.events.on('connection', (queue) => {
    console.log('Player connected!')
  })

  // player.events.on('debug', (queue, message) => {
  //   console.log('\n', message)
  // })

  player.events.on('disconnect', (queue) => {
    client.user.setPresence({
      activities: [{
        name: 'a bug',
        type: ActivityType.Watching
      }]
    })
    console.log('Player disconnected.')
  })

  player.events.on('emptyChannel', (queue) => {
    console.log('Voice channel empty.')
  })

  player.events.on('emptyQueue', (queue) => {
    client.user.setPresence({
      activities: [{
        name: 'you, unblinkingly',
        type: ActivityType.Watching
      }]
    })
    console.log('Queue empty.')
  })

  player.events.on('error', (queue, error) => {
    console.error('Error:', error.message, 'with track', error.resource.metadata.title)
  })

  player.events.on('playerError', (queue, error, track) => {
    console.error('playerError:', error.message, 'with track', track.title)
  })

  player.events.on('playerFinish', (queue, track) => {
    console.log(`Finished track: ${track.title}`)
  })

  player.events.on('playerSkip', (queue, track) => {
    console.log(`Skipped track: ${track.title}`)
  })

  player.events.on('playerStart', (queue, track) => {
    // Report track start
    queue.metadata.send({
      content: `:musical_note: ${track.title}`,
      ephemeral: 'true'
    }).catch(e => { console.log(e) })
    // Set bot activity
    client.user.setPresence({
      activities: [{
        name: track.title,
        type: ActivityType.Listening,
        url: track.url
      }]
    })
    console.log(`Playing: ${track.title}`)
  })

  // player.events.on('playerTrigger', (queue, track, reason) => {
  //   console.log(`Player triggered! Track: ${track.title}, Reason: ${reason}`)
  // })

  // player.events.on('voiceStateUpdate', (queue, oldState, newState) => {
  //   console.log(`voiceStateUpdate: oldState ${oldState}, newState ${newState}`)
  // })
}

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

function buildEmbed(interaction) {
  const client = interaction.client
  // Track info embed
  const embed = new EmbedBuilder()
    .setColor(client.config.color)
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
  return embed
}

function buildButtons(interaction) {
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
  return rows
}

function handleButton(interaction) {
  // Confirm receipt of button interaction (must be within 3 seconds)
  interaction.deferUpdate()

  // Do button stuff based on button ID
  const queue = interaction.client.player.getQueue(interaction.guildId)
  switch (interaction.customId) {
    // Return to previous track or start of current track
    case 'prev':
      // TODO: return to start of current track if enough time ellapsed
      // TODO: verify previous track exists
      if (queue.previousTracks) queue.back()
      break
    // Toggle pause
    case 'play':
      queue.setPaused(!queue.connection.paused)
      // TODO: Show pause status on button
      break
    // Stop player
    case 'stop':
      queue.stop()
      break
    // Skip to next track
    case 'next':
      // TODO: Verify next track exists
      queue.skip()
      break
    // Cycle through repeat modes
    case 'repeat':
      queue.setRepeatMode((queue.repeatMode + 1 % 3))
      // TODO: Show repeat status on button
      break
    // Test button
    case 'cool':
      // TODO: airhorn?
      console.log('cool')
      break
    // DM current track to user
    case 'saveTrack': {
      if (!queue || !queue.playing) return
      const client = interaction.client
      const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setTitle('Saved track')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: 'Track', value: `\`${queue.current.title}\`` },
          { name: 'Duration', value: `\`${queue.current.duration}\`` },
          { name: 'URL', value: `${queue.current.url}` },
          { name: 'Heard in', value: `\`${interaction.guild.name}\`` }
        ).setTimestamp()
      interaction.member.send({ embeds: [embed] })
        .catch(e => { console.log(e) })
      break
    }
    case 'time': {
      if (!queue || !queue.playing) return

      const timestamp = queue.getPlayerTimestamp()
      if (timestamp.progress === 'Infinity') {
        return interaction.message.edit({ content: ':infinity:' })
          .catch(e => { console.log(e) })
      }

      const client = interaction.client
      const progress = queue.createProgressBar()
      const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setTitle(queue.current.title)
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setDescription(`${progress} (**${timestamp.progress}**%)`)
      interaction.message.edit({ embeds: [embed] })
        .catch(e => console.log(e))
      break
    }
    default:
      console.log(interaction.customId)
  }
}

module.exports = { initPlayer, buildEmbed, buildButtons }
