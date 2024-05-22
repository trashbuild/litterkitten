const {
  ActionRowBuilder,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js')
const { Player } = require('discord-player')

function qlog(msg, queue, logFunc = console.log) {
  // Log message in console with the guild it came from
  logFunc(`${queue.guild.name}: ${msg}`)
}

function statusIdle(client) {
  // Set bot status to idle
  // TODO: verify no queues playing
  client.user.setPresence({
    activities: [{
      name: 'a bug',
      type: ActivityType.Watching
    }]
  })
}

function statusListening(client, track) {
  // Set bot status according to music
  client.user.setPresence({
    activities: [{
      name: track.title,
      type: ActivityType.Listening,
      url: track.url
    }]
  })
}

function initPlayer(client) {
  // Build the music player
  const player = Player.singleton(client)
  player.extractors.loadDefault()

  // Event handling
  player.on('audioTrackAdd', (queue, track) => {
    queue.channel.send({
      content: `:white_check_mark: ${track.title}`
    }).catch(e => { qlog(e, queue) })
    qlog(`Added ${track.title}`, queue)
  })

  player.on('audioTracksAdd', (queue, tracks) => {
    queue.channel.send({
      content: `:white_check_mark: ${tracks.length} :music_note:`
    }).catch(e => { qlog(e, queue) })
    qlog(`Added ${tracks.length} tracks`, queue)
  })

  player.on('audioTrackRemove', (queue, track) => {
    queue.channel.send({
      content: `:x: ${track.title}`
    }).catch(e => { qlog(e, queue) })
    qlog(`Removed ${track.title}`, queue)
  })

  player.on('audioTracksRemove', (queue, tracks) => {
    queue.channel.send({
      content: `:x: ${tracks.length} :music_note:`
    }).catch(e => { qlog(e, queue) })
    qlog(`Removed ${tracks.length} tracks`, queue)
  })

  player.events.on('connection', (queue) => {
    statusIdle(client)
    qlog('Player connected!', queue)
  })

  // player.events.on('debug', (queue, message) => {
  //   qlog(message, queue)
  // })

  player.events.on('disconnect', (queue) => {
    statusIdle(client)
    qlog('Player disconnected.', queue)
  })

  player.events.on('emptyChannel', (queue) => {
    qlog('Voice channel empty.', queue)
  })

  player.events.on('emptyQueue', (queue) => {
    statusIdle(client)
    qlog('Queue empty.', queue)
  })

  player.events.on('error', (queue, error) => {
    qlog(`Error: ${error.message}, Track: ${error.resource.metadata.title}`, queue, console.error)
  })

  player.events.on('playerError', (queue, error, track) => {
    qlog(`playerError: ${error.message}, Track: ${track.title}`, queue, console.error)
  })

  player.events.on('playerFinish', (queue, track) => {
    qlog(`Finished track: ${track.title}`, queue)
  })

  player.events.on('playerSkip', (queue, track) => {
    qlog(`Skipped track: ${track.title}`, queue)
  })

  player.events.on('playerStart', (queue, track) => {
    // Report track start
    queue.channel.send({
      content: `:musical_note: ${track.title}`,
      ephemeral: 'true'
    }).catch(e => { qlog(e, queue) })
    // Set bot activity
    statusListening(client, track)
    qlog(`Playing: ${track.title}`, queue)
  })

  // player.events.on('playerTrigger', (queue, track, reason) => {
  //   qlog(`Player triggered! Track: ${track.title}, Reason: ${reason}`, queue)
  // })

  // player.events.on('voiceStateUpdate', (queue, oldState, newState) => {
  //   qlog(`voiceStateUpdate: oldState ${oldState}, newState ${newState}`, queue)
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
      qlog('cool', queue)
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
        .catch(e => { qlog(e, queue) })
      break
    }
    case 'time': {
      if (!queue || !queue.playing) return

      const timestamp = queue.getPlayerTimestamp()
      if (timestamp.progress === 'Infinity') {
        return interaction.message.edit({ content: ':infinity:' })
          .catch(e => { qlog(e, queue) })
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
        .catch(e => qlog(e, queue))
      break
    }
    default:
      qlog(interaction.customId, queue)
  }
}

module.exports = { initPlayer, buildEmbed, buildButtons }
