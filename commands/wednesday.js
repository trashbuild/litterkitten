module.exports = {
  description: 'For when it is Wednesday.',
  name: 'wednesday',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Load Wednesday playlist from config file
    interaction.args = [client.config.wednesday]
    client.commands.get('play').run(client, interaction)
      // Wait 5 seconds for queue creation
      .then(setTimeout(() => {
        // Shuffle queue
        interaction.silent = true
        client.commands.get('shuffle').run(client, interaction)
        // Set to conversational volume
        interaction.args = [25]
        client.commands.get('volume').run(client, interaction)
      }, 5000)
      )
  }
}
