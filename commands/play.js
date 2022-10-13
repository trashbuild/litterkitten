const sounds = require('../kitten-sounds.js')
const { QueryType } = require('discord-player')
const { SlashCommandBuilder } = require('discord.js')
// Fix "cannot play resource that has already ended"
const playdl = require('play-dl')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music.')
    .addStringOption(option =>
      option.setName('track')
        .setDescription('Track title or url')
        .setRequired(false)),

  async execute(interaction) {
    const client = interaction.client
    // Verify that channel is correct
    // HACK: hardcoded #bot-spam
    if (interaction.channel.id !== '416808433493344269') {
      return interaction.reply({
        content: `${sounds.angy()} :x:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // If no args given, just try to resume playback
    if (interaction.args.length === 0) {
      const queue = client.player.getQueue(interaction.guild.id)
      if (queue && !queue.playing) {
        await queue.play()
        return interaction.reply({
          content: `${sounds.confused()} :floppy_disc:`,
          ephemeral: true
        }).catch(e => { console.log(e) })
      }
    }

    // If args given, search for those terms
    const res = await client.player.search(
      interaction.args.join(' '),
      { requestedBy: interaction.member, searchEngine: QueryType.AUTO }
    )

    // Verify music info
    if (!res || !res.tracks.length) {
      return interaction.reply({
        content: `${sounds.no()} :weary:`,
        ephemeral: true
      }).catch(e => { console.log(e) })
    }

    // Send "working" message
    await interaction.reply({
      content: sounds.working(),
      ephemeral: true
    }).catch(e => { console.log(e) })

    // Create queue for this guild (server)
    const queue = await client.player.createQueue(interaction.guild, {
      leaveOnEnd: true,
      autoSelfDeaf: true,
      metadata: interaction.channel,
      // Fix max volume on track start
      volumeSmoothness: false,
      // Fix "can't play resource that has already ended"
      async onBeforeCreateStream(track, source, _queue) {
        if (source === 'youtube') {
          return (
            await playdl.stream(
              track.url,
              { discordPlayerCompatibility: true }
            )).stream
        }
      }
    })

    // Establish/verify voice channel connection
    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel)
          .catch(e => { console.log(e) })
      }
    } catch {
      // Delete queue on failure
      await client.player.deleteQueue(interaction.guild.id)
      return interaction.editReply({
        content: `${sounds.angy()} :desktop:`,
        ephemeral: true
      })
    }

    // Add track(s)
    res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0])
    // Play (if not already playing)
    if (!queue.playing) await queue.play()
    // Report success
    if (queue.playing) {
      interaction.editReply({
        content: `${sounds.yes()}:white_check_mark`,
        ephemeral: false
      })
    }
  }
}
