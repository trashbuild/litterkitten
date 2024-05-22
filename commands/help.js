const {
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('How to the kitten.'),

  async execute(interaction) {
    // Get list of commands (except hidden ones)
    const client = interaction.client
    const commands = client.commands.filter(x => x.showHelp !== false)

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setDescription('"It hath an head like a swine, and a tail like a rat,' +
        ' and is of the bigness of a cat."')
      .setFooter({
        text: 'Kitten how-to',
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(client.user.displayAvatarURL())
      .setTitle(client.user.username)
      .addFields(
        {
          name: `${commands.size} commands available:`,
          value: commands.map(x => `\`/${x.name}\``).join(' | ')
        },
        {
          name: 'Source',
          value: 'https://github.com/trashbuild/litterkitten'
        }
      )

    // Send reply
    interaction.reply({ embeds: [embed] })
      .catch(e => { console.log(e) })
  }
}
