// Music player
const { Player } = require('discord-player')
// Discord interface
const { Client, Intents, Collection } = require('discord.js')
// Built-in filesystem reader
const fs = require('fs')

// Create the actual bot with the things it intends to do
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
})

// Load the config file
client.config = require('./config.json')

// Make commands available from client.commands
client.commands = new Collection()

// Register slash commands from "commands" directory
const synchronizeSlashCommands = require('discord-sync-commands-v14')
fs.readdir('./commands/', (_err, files) => {
  // Load all commands
  files.forEach((file) => {
    // Skip files that don't end with .js
    if (!file.endsWith('.js')) return
    // Load properties of the command
    const props = require(`./commands/${file}`)
    // Drop ".js"
    const commandName = file.split('.')[0]
    // Set command
    client.commands.set(commandName, {
      name: commandName,
      ...props
    })
    console.log(`Loaded slash command: ${commandName}`)
  })
  // Register commands
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
    console.log(`Event loaded: ${eventName}`)
    client.on(eventName, event.bind(null, client))
    delete require.cache[require.resolve(`./events/${file}`)]
  })
})

// Build the music player
client.player = new Player(client, {
  voiceConfig: {
    leaveOnEnd: true, // If this variable is "true", the bot will leave the channel the music ends.
    autoSelfDeaf: true // IF YOU WANT TO DEAF THE BOT, set false to true.
  },
  maxVol: 100, // You can specify the maximum volume level.
  loopMessage: false,
  discordPlayer: {
    ytdlOptions: {
      quality: 'highestaudio', // Please don't touch
      highWaterMark: 1 << 25 // Please don't touch
    }
  }
})
client.player.on('trackStart', (queue, track) => {
  queue.metadata.send({ content: `🎵 Music started playing: **${track.title}** -> Channel: **${queue.connection.channel.name}** 🎧` }).catch(e => { })
})

client.player.on('trackAdd', (queue, track) => {
  queue.metadata.send({ content: `**${track.title}** added to playlist. ✅` }).catch(e => { })
})

client.player.on('channelEmpty', (queue) => {
  queue.metadata.send({ content: 'I left the audio channel because there is no one on my audio channel. ❌' }).catch(e => { })
})

client.player.on('queueEnd', (queue) => {
  if (queue.connection) queue.connection.disconnect()
})

// Login!
client.login(client.config.token)
