const { EmbedBuilder } = require('discord.js')

module.exports = {
  name: 'help',
  type: 1,
  description: 'How to the kitten.',
  options: [],
  showHelp: false,

  run: async (client, interaction) => {
    // Get list of commands (except hidden ones)
    const commands = client.commands.filter(x => x.showHelp !== false)

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(client.config.color)
      .setTitle(client.user.username)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('"It hath an head like a swine, and a tail like a rat,' +
        ' and is of the bigness of a cat."')
      .addFields(
        {
          name: `${commands.size} commands available:`,
          value: commands.map(x => `\`/${x.name}\``).join(' | ')
        },
        { name: 'Source', value: 'https://github.com/trashbuild/litterkitten' }
      )
      .setTimestamp()
      .setFooter({
        text: 'Kitten how-to',
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })

    // Send reply
    interaction.reply({ embeds: [embed] })
      .catch(e => { console.log(e) })
  }
}
