const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMasterPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music.')
    .addStringOption(option =>
      option.setName('track')
        .setDescription('Track title or url')
        .setRequired(false)),

  async execute(interaction) {
    // Verify text channel
    // HACK: hardcoded #bot-spam
    if (interaction.channel.id !== '416808433493344269') {
      return interaction.reply({
        content: `${sounds.angy()} :x:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Verify voice channel
    const channel = interaction.member.voice.channel
    if (!channel) {
      return interaction.reply({
        content: `${sounds.angy()} :x:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // If no args given, just try to resume playback
    const player = useMasterPlayer()
    if (interaction.args.length === 0) {
      if (player && !player.playing) {
        await player.play()
        return interaction.reply({
          content: `${sounds.confused()} :floppy_disc:`,
          ephemeral: true
        }).catch(e => { console.log(e) })
      }
    }

    // Send "working" message
    await interaction.deferReply({
      content: sounds.working(),
      ephemeral: true
    }).catch(e => { console.log(e) })

    // If args given, search for those terms
    const searchResult = await player.search(
      interaction.args.join(' '),
      { requestedBy: interaction.member }
    )

    // Verify search result
    if (!searchResult || !searchResult.hasTracks()) {
      return interaction.editReply({
        content: `${sounds.no()} :weary:`
      }).catch(e => { console.log(e) })
    }
    console.log(`Tracks: ${searchResult.tracks.length}`)

    // Play music
    await player.play(channel, searchResult, {
      nodeOptions: {
        metadata: interaction.channel,
        volume: 6,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 300000,
        leaveOnEnd: true,
        leaveOnEndCooldown: 300000
      }
    }).catch(e => { console.log(e) })

    await interaction.editReply({
      content: `${sounds.yes()}:white_check_mark:`
    })
    // }
  }
}
