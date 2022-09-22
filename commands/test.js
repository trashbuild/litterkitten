module.exports = {
  name: 'test',
  type: 1,
  description: 'Test!',
  options: [],
  showHelp: false,

  run: async (client, interaction) => {
    console.log(interaction)
    interaction.reply('hello!')
  }
}
