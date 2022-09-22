// Built-in filesystem reader
const fs = require('fs')
// Discord interface
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js')
// Music player
const { Player } = require('discord-player')
// const downloader = require('@discord-player/downloader').Downloader
// Simplify registering commands with Discord
const synchronizeSlashCommands = require('discord-sync-commands-v14')

// Create the actual bot with the things it intends to do
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel] // Fixes a bug where bots don't get notified of DMs
})

// Load the config file
client.config = require('./config.json')

// Load commands from "commands" directory
client.commands = new Collection()
fs.readdir('./commands/', (_err, files) => {
  // Load command
  files.forEach((file) => {
    if (!file.endsWith('.js')) return
    const props = require(`./commands/${file}`)
    const commandName = file.split('.')[0]
    client.commands.set(commandName, {
      name: commandName,
      ...props
    })
  })
  // Register command
  synchronizeSlashCommands(client, client.commands.map((c) => ({
    name: c.name,
    type: c.type,
    options: c.options,
    description: c.description
  })), {
    debug: false
  })
})

// Handle events from "events" directory
fs.readdir('./events', (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith('.js')) return
    const event = require(`./events/${file}`)
    const eventName = file.split('.')[0]
    client.on(eventName, event.bind(null, client))
    delete require.cache[require.resolve(`./events/${file}`)]
  })
})

// Build the music player
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
      // opusEncoded: true,
      quality: 'highestaudio'
      // highwatermark: 1 << 30
    }
  }
})
// client.player.use('YOUTUBE_DL', downloader)

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

// Login!
client.login(client.config.token)
