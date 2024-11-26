const sounds = require('../../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music.')
    .addStringOption(option =>
      option.setName('track')
        .setDescription('Track title or url')
        .setRequired(true)),

  async execute(interaction) {
    // Verify action was requested from a voice channel that the user is in
    const channel = interaction.channel
    if (!channel.isVoiceBased() | channel !== interaction.member.voice.channel) {
      return interaction.reply({
        content: `${sounds.angy()} :x:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // If no args given, just try to unpause
    // TODO

    // Send "working" message
    await interaction.deferReply({ ephemeral: true })
      .catch(e => { console.log(e) })

    // Search for given terms
    const player = useMainPlayer()
    const searchResult = await player.search(
      interaction.args.join(' '),
      { requestedBy: interaction.member }
    )

    // Verify result
    if (!searchResult || !searchResult.hasTracks()) {
      return interaction.editReply({
        content: `${sounds.no()} :weary:`
      }).catch(e => { console.log(e) })
    }
    console.log(`Tracks: ${searchResult.tracks.length}`)

    // Play music
    await player.play(channel, searchResult, {
      nodeOptions: {
        volume: 5,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 300000,
        leaveOnEnd: true,
        leaveOnEndCooldown: 300000
      }
    }).catch(e => { console.log(e) })

    await interaction.editReply({
      content: `${sounds.yes()}:white_check_mark:`
    })
  }
}
