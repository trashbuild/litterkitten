// Node imports
const fs = require('node:fs')
const path = require('node:path')

// Discord imports
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js')
const { Player } = require('discord-player')

// Create the actual bot with the things it intends to do
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ],
  // Fix failure to read DMs
  partials: [Partials.Channel]
})

// Load the config file
client.config = require('./config.json')

// Load commands from "commands" directory into client.commands
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  const commandName = file.split('.')[0]
  client.commands.set(commandName, command)
}

// Load events from "events" directory
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  const eventName = file.split('.')[0]
  if (event.once) {
    client.once(eventName, (...args) => event.execute(...args))
  } else {
    client.on(eventName, (...args) => event.execute(...args))
  }
}

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

// Login!
client.login(client.config.token)
