module.exports = {
  execute(interaction) {
    if (interaction.isChatInputCommand()) {
      // Verify that command exists
      const command = interaction.client.commands.get(interaction.commandName)
      if (!command) return

      // Turn options into args for compatibility with message commands
      // TODO: reformat message interactions instead of slash commands
      interaction.args = []
      interaction.options.data.forEach((option) => {
        interaction.args.push(option.value)
      })
      interaction.silent = false

      // Do command
      console.log(`Running slash command: ${interaction.commandName}`)
      try {
        return command.execute(interaction)
      } catch (error) {
        console.error(error)
        interaction.reply({ content: ':x:', ephemeral: true })
      }
    }
    // if (interaction.isButton()) {}

    console.log('\n\n Unhandled interaction:\n\n')
    console.log(interaction)
  }
}
