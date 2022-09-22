module.exports = {
  description: 'For when it is Wednesday.',
  name: 'wednesday',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Load Wednesday playlist from config file
    interaction.args = [client.config.wednesday]
    // Play, then shuffle and set volume after timeout
    client.commands.get('play').run(client, interaction)
      .then(setTimeout(() => {
        interaction.silent = true
        client.commands.get('shuffle').run(client, interaction)
        interaction.args = [25]
        client.commands.get('volume').run(client, interaction)
      }, 6000))
  }
}
