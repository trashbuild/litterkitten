const fs = require('node:fs')
const path = require('node:path')
const { REST, Routes } = require('discord.js')
const {
  clientId,
  // guildId,
  token
} = require('./config.json')

// Load commands to register
const commands = []
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  commands.push(command.data.toJSON())
}

// Communicate with Discord
const rest = new REST({ version: '10' }).setToken(token)

// // Delete guild-based commands
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
//   .then(() => console.log('Successfully deleted all guild commands.'))
//   .catch(console.error)

// // Delete global commands
// rest.put(Routes.applicationCommands(clientId), { body: [] })
//   .then(() => console.log('Successfully deleted all application commands.'))
//   .catch(console.error)

// // Register as guild commands
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
//   .then((data) => console.log(`Successfully registered ${data.length} guild commands.`))
//   .catch(console.error)

// Register as global commands
rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
  .catch(console.error)
