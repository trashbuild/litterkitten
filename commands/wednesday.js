module.exports = {
  description: 'For when it is Wednesday.',
  name: 'wednesday',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    // Load Wednesday playlist from config file
    interaction.args = [client.config.wednesday]
    // Play and trigger shuffle after 5 seconds
    await client.commands.get('play').run(client, interaction)
      .then(setTimeout(() => {
        interaction.silent = true
        client.commands.get('shuffle').run(client, interaction)
      }, 5000))
    // Set to conversational volume
    client.player.getQueue(interaction.guild.id).setVolume(25)
  }
}
