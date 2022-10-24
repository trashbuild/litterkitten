const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  // ComponentType,
  EmbedBuilder
} = require('discord.js')
const { Player } = require('discord-player')

function initPlayer(client) {
  client.player = new Player(client, {
    voiceConfig: {
      leaveOnEnd: true,
      autoSelfDeaf: true
    },
    bufferingTimeout: 6000,
    maxVol: 100,
    loopMessage: false,
    discordPlayer: {
      ytdlOptions: {
        filter: 'audioonly',
        quality: 'highestaudio'
        // highwatermark: 1 << 30
      }
    }
  })

  // Event handling
  client.player.on('botDisconnect', (queue) => {
    console.log('botDisconnect')
    queue.destroy()
    client.user.setActivity('a bug', { type: 'WATCHING' })
  })

  client.player.on('channelEmpty', (queue) => {
    console.log('channelEmpty')
    queue.stop()
    client.user.setActivity('a bug', { type: 'WATCHING' })
  })

  client.player.on('connectionError', (queue, error) => {
    console.log('connectionError')
    console.log(error)
    queue.play()
  })

  client.player.on('error', (queue, error) => {
    console.log('error')
    console.log(error)
    queue.play()
  })

  client.player.on('queueEnd', (queue) => {
    if (queue.connection) queue.connection.disconnect()
    client.user.setActivity('a bug', { type: 'WATCHING' })
  })

  client.player.on('trackAdd', (queue, track) => {
    console.log(`Added: ${track.title}`)
    queue.metadata.send({
      content: `:white_check_mark: ${track.title}`
    }).catch(e => { console.log(e) })
  })

  client.player.on('trackStart', (queue, track) => {
    console.log(`Playing: ${track.title}`)
    queue.metadata.send({
      content: `:musical_note: ${track.title}`
    }).catch(e => { console.log(e) })
    client.user.setActivity(track.title, {
      name: track.title,
      type: 'STREAMING',
      url: track.url
    })
  })
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
