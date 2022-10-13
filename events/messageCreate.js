const sounds = require('../kitten-sounds.js')

module.exports = {
  execute(interaction) {
    const client = interaction.client

    // First and foremost, acknowledge the funny number
    if (interaction.content.includes('69')) {
      interaction.react('<:NICE:466837748263682059>')
    }

    // Ignore bots (including self)
    if (interaction.author.bot) return

    // // Handle DMs
    // if (int.channel.type === 'DM') {
    //   console.log(int.content)
    //   int.reply('Hello!')
    // }

    // Parse arguments and check for prefix
    const args = interaction.content.split(' ')
    if (args.shift() !== client.config.prefix) return

    // Check that command exists
    const command = client.commands.get(args.shift())
    if (!command) {
      return interaction.reply({
        content: sounds.confused(),
        ephemeral: true
      })
    }

    // Trigger command directly
    interaction.args = args
    interaction.silent = false
    interaction.user = interaction.author
    console.log(`Running message command: ${command.name} ${args.join(' ')}`)
    command.execute(interaction)
  }
}
