// const sounds = require('../kitten-sounds.js')

module.exports = {
  description: 'For when it is Wednesday.',
  name: 'wednesday',
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    interaction.args = [client.config.wednesday]
    client.commands.get('play').run(client, interaction)
      .then(setTimeout(() => {
        interaction.silent = true
        client.commands.get('shuffle').run(client, interaction)
        interaction.args = [25]
        client.commands.get('volume').run(client, interaction)
      }, 5000)
      )
  }
}
