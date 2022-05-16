const sounds = require('../kitten-sounds.js')

module.exports = (client, int) => {
  // First and foremost, acknowledge the funny number
  if (int.content.includes('69')) {
    int.react('<:NICE:466837748263682059>')
  }

  // Ignore bots (including self)
  if (int.author.bot) return

  // Parse and check for prefix
  const args = int.content.split(' ')
  if (args.shift() !== client.config.prefix) return

  // Check that command exists
  const command = client.commands.get(args.shift())
  if (!command) {
    return int.reply({
      content: sounds.confused(),
      ephemeral: true
    })
  }

  // Trigger command directly
  int.args = args
  command.run(client, int)
}
