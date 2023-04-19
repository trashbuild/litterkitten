const { SlashCommandBuilder } = require('discord.js')

async function sendAnalysis(interaction, data) {
  // Create embed from response data
  const embed = new EmbedBuilder()
    .setTitle("Poe'd it.")
    .setDescription(interaction.content)
    .addFields(
        { name: 'Form', value: data.form },
        { name: 'Lines', value: data.lines.toString() },
        { name: 'Meter', value: data.meter },
        { name: 'Rhyme scheme', value: data.rhyme_scheme },
        { name: 'Rhyme type', value: data.rhyme_type },
        { name: 'Stanza', value: data.stanza },
        { name: 'Stanza lengths', value: data.stanza_lengths },
        { name: 'Stress pattern', value: data.stress.toString() },
        { name: 'Syllables', value: data.syllables.toString() }
    )
  // Edit embed into reply
  return interaction.editReply({ embeds: [embed] })
    .catch(e => { console.log(e) })
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poeit')
    .setDescription('Analyze a message to guess its poetic form.'),

  async execute(interaction) {
    // Acknowledge message received
    interaction.deferReply()
    // Get poem analysis
    fetch(client.config.poeit, {
        method: 'POST',
        headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: interaction.content
        })
    })
    // Send analysis results
    .then((response) => response.json())
    .then((data) => sendAnalysis(interaction, data))
    .catch(e => console.log(e))
  }
}
