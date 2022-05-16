module.exports = {
  description: 'For when it is Wednesday.',
  name: 'wednesday',
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    interaction.args = [
      'https://www.youtube.com/watch?v=9Y6uWBIPZVU&list=PLp3lk5Yt8dYZamVFnDcM1OIdHZSvHo8EP'
    ]
    client.commands.get('play').run(client, interaction).then(
      setTimeout(client.commands.get('shuffle').run, 1000, client, interaction)
    )
  }
}
