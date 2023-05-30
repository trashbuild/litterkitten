const discord = require('discord.js')

module.exports = {
  once: true,
  execute(client) {
    console.log(`\n${client.user.username} wakes from its slumber!\n`)
    client.user.setPresence({
      activities: [{ 
        name: 'a bug', 
        type: discord.ActivityType.Watching
      }]
    })
  }
}
