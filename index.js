// Music player
const { Player } = require('discord-player')
// Discord interface
const { Client, Intents, Collection } = require('discord.js')
// Built-in filesystem reader
const fs = require('fs')
// Simplify registering commands with Discord
const synchronizeSlashCommands = require('discord-sync-commands-v14')

// Create the actual bot with the things it intends to do
const client = new Client({
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
  partials: ['CHANNEL'] // Fixes a bug where bots don't get notified of DMs
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
    description: c.description,
    options: c.options,
    type: 'CHAT_INPUT'
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
  maxVol: 100,
  loopMessage: false,
  discordPlayer: {
    ytdlOptions: {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 27 // 128 MB
    }
  }
})

// Event handling
client.player.on('botDisconnect', (queue) => {
  console.log('botDisconnect')
  queue.destroy()
})

client.player.on('channelEmpty', (queue) => {
  console.log('channelEmpty')
  queue.stop()
})

client.player.on('connectionError', (queue, error) => {
  console.log('connectionError')
  console.log(error)
  // queue.metadata.send({
  //   content: 'Connection error, skipping track...'
  // }).catch(e => { console.log(e) })
  // queue.skip()
  queue.play()
})

client.player.on('error', (queue, error) => {
  console.log('error')
  console.log(error)
  // queue.metadata.send({
  //   content: 'Unspecified error, skipping track...'
  // }).catch(e => { console.log(e) })
  // queue.skip()
  queue.play()
})

client.player.on('queueEnd', (queue) => {
  if (queue.connection) queue.connection.disconnect()
})

client.player.on('trackAdd', (queue, track) => {
  console.log(`Added: ${track.title}`)
  queue.metadata.send({
    content: `**${track.title}** :white_check_mark:`
  }).catch(e => { console.log(e) })
})

client.player.on('trackStart', (queue, track) => {
  console.log(`Playing: ${track.title}`)
  queue.metadata.send({
    content: `**${track.title}** :musical_note:`
  }).catch(e => { console.log(e) })
})

// Login!
client.login(client.config.token)
