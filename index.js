// Imports
const fs = require('node:fs')
const path = require('node:path')
const discord = require('discord.js')

// Create the actual bot with the things it intends to do
const client = new discord.Client({
  intents: [
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildMembers,
    discord.GatewayIntentBits.GuildMessages,
    discord.GatewayIntentBits.GuildVoiceStates,
    discord.GatewayIntentBits.MessageContent
  ],
  // Fix failure to read DMs
  partials: [discord.Partials.Channel]
})

// Load the config file
client.config = require('./config.json')

// Load commands from "commands" directory into client.commands
client.commands = new discord.Collection()
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

// Create player
const player = require('./player.js')
player.initPlayer(client)

// Login!
client.login(client.config.token)
