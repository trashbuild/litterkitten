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
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
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
const player = Player.singleton(client)

// Event handling
player.on('audioTrackAdd', (queue, track) => {
  console.log(`Added: ${track.title}`)
  queue.metadata.send({
    content: `:white_check_mark: ${track.title}`
  }).catch(e => { console.log(e) })
})

player.on('audioTracksAdd', (queue, tracks) => {
  console.log(`Added: ${tracks.length} tracks`)
  queue.metadata.send({
    content: `:white_check_mark: ${tracks.length} :music_note:`
  }).catch(e => { console.log(e) })
})

player.on('audioTrackRemove', (queue, track) => {
  console.log(`Removed: ${track.title}`)
  queue.metadata.send({
    content: `:x: ${track.title}`
  }).catch(e => { console.log(e) })
})

player.on('audioTracksRemove', (queue, tracks) => {
  console.log(`Removed: ${tracks.length} tracks`)
  queue.metadata.send({
    content: `:x: ${tracks.length} :music_note:`
  }).catch(e => { console.log(e) })
})

player.events.on('connection', (queue) => {
  console.log('Player connected!')
})

// player.events.on('debug', (queue, message) => {
//   console.log(message)
// })

player.events.on('disconnect', (queue) => {
  console.log('Player disconnected.')
  queue.delete()
  client.user.setActivity('a bug', { type: 'WATCHING' })
})

player.events.on('emptyChannel', (queue) => {
  console.log('Voice channel empty.')
  client.user.setActivity('a bug', { type: 'WATCHING' })
})

player.events.on('emptyQueue', (queue) => {
  console.log('Queue empty.')
  client.user.setActivity('a bug', { type: 'WATCHING' })
})

player.events.on('error', (queue, error) => {
  console.log('Error!')
  console.log(error)
  // queue.play()
})

player.events.on('playerError', (queue, error, track) => {
  console.log(`playerError! Track: ${track.title}`)
  console.log(error)
  // queue.play()
})

player.events.on('playerFinish', (queue, track) => {
  console.log(`Finished track: ${track.title}`)
})

player.events.on('playerSkip', (queue, track) => {
  console.log(`Skipped track: ${track.title}`)
})

player.events.on('playerStart', (queue, track) => {
  // Report track start
  console.log(`Playing: ${track.title}`)
  queue.metadata.send({
    content: `:musical_note: ${track.title}`
  }).catch(e => { console.log(e) })
  // Set bot activity
  client.user.setActivity(track.title, {
    name: track.title,
    type: 'STREAMING',
    url: track.url
  })
})

// player.events.on('playerTrigger', (queue, track, reason) => {
//   console.log(`Player triggered! Track: ${track.title}, Reason: ${reason}`)
// })

// player.events.on('voiceStateUpdate', (queue, oldState, newState) => {
//   console.log(`voiceStateUpdate: oldState ${oldState}, newState ${newState}`)
// })

// Login!
client.login(client.config.token)
