const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder
} = require('discord.js')

function makeButton(btn) {
  // Turn an {id, emoji} object into an actual button
  return new ButtonBuilder()
    .setCustomId(btn.id)
    .setEmoji(btn.emoji)
    .setStyle(ButtonStyle.Secondary)
}

function makeRow(row) {
  // Turn a list of {id, emoji} objects into a simple action row
  return new ActionRowBuilder().addComponents(row.map(makeButton))
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test!'),

  async execute(interaction) {
    // Track info embed
    const embed = new EmbedBuilder()
      // .setColor()
      .setTitle('Test embed')
      .setURL('https://github.com/trashbuild/litterkitten')
      // .setAuthor({ name: 'test', iconURL: ''})
      .setDescription('Test embed!')
      // .setThumbnail('test.png')
      .addFields(
        { name: 'test', value: 'test' }
      )
      // .setImage('test')
      .setTimestamp()
      .setFooter({ text: 'Footer text!' }) //, iconURL: 'test' })

    // Player control buttons
    const rows = [
      [
        { id: 'prev', emoji: '⏮️' },
        { id: 'play', emoji: '⏯️' },
        { id: 'stop', emoji: '⏹️' },
        { id: 'next', emoji: '⏭️' }
      ], [
        { id: 'repeat', emoji: '🔁' },
        { id: 'cool', emoji: '🆒' }
      ]
    ].map(makeRow)

    // Post music player to interaction channel
    interaction.reply({ embeds: [embed], components: rows })
  }
}
