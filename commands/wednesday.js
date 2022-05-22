// const sounds = require('../kitten-sounds.js')

module.exports = {
  description: 'For when it is Wednesday.',
  name: 'wednesday',
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    interaction.args = [
      'https://www.youtube.com/watch?v=9Y6uWBIPZVU&list=PLp3lk5Yt8dYZamVFnDcM1OIdHZSvHo8EP'
    ]
    client.commands.get('play').run(client, interaction)
      .then(setTimeout(() => {
        interaction.silent = true
        client.commands.get('shuffle').run(client, interaction)
        interaction.args = [20]
        client.commands.get('volume').run(client, interaction)
      }, 5000)
      )
  }
}
