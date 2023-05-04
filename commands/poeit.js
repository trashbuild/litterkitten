const {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js')
const sounds = require('../kitten-sounds.js')

async function handlePoem(interaction) {
  await interaction.deferReply()

  // Get and verify poem input
  const poem = interaction.fields.getTextInputValue('poeitInput')
  if (poem === '') {
    interaction.editReply(sounds.confused())
    return
  }

  // Get analysis
  fetch(interaction.client.config.poeit, {
    method: 'POST',
    headers: {
      Accept: 'application.json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: poem
    })
  })

    // Parse result
    .then((response) => response.json())
    .then((data) => {
      // Create embed from response data
      const embed = new EmbedBuilder()
        .setTitle('🤓')
        .setDescription(poem)
        .addFields(
          { name: 'Form', value: data.form, inline: true },
          { name: 'Meter', value: data.meter, inline: true },
          { name: 'Rhyme type', value: data.rhyme_type, inline: true },
          { name: 'Rhyme scheme', value: data.rhyme_scheme, inline: true },
          { name: 'Stanza type', value: data.stanza, inline: true },
          { name: 'Stanza lengths', value: data.lengths, inline: true },
          {
            name: 'Syllables',
            value: data.syllables.toString().replaceAll(',', '\n'),
            inline: true
          },
          {
            name: 'Stress pattern',
            value: data.stress.toString().replaceAll(',', '\n'),
            inline: true
          },
          { name: 'Lines', value: data.lines.toString(), inline: true }
        )

      // Edit embed into reply
      interaction.editReply({ embeds: [embed] })
    })

    // Handle errors
    .catch((e) => {
      interaction.editReply(sounds.confused())
      console.log(e)
    })
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poeit')
    .setDescription('Analyze a message to guess its poetic form.'),

  async execute(interaction) {
    if (~interaction.client.config.poeit) return

    // Get poem via modal input form
    const poemInput = new TextInputBuilder()
      .setCustomId('poeitInput')
      .setLabel('✏️')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
    const poemInputRow = new ActionRowBuilder().addComponents(poemInput)
    const modal = new ModalBuilder()
      .setCustomId('poeitForm')
      .setTitle('Poeit')
      .addComponents(poemInputRow)
    await interaction.showModal(modal)

    // Handle response
    const poeitFilter = i => i.customId === 'poeitForm'
    interaction.awaitModalSubmit({ poeitFilter, time: 300_000 })
      .then((poemInteraction) => handlePoem(poemInteraction))
      .catch((e) => console.log(e))
  }
}
