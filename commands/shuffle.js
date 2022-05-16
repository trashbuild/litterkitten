module.exports = {
  description: 'Shuffles the playlist.',
  name: 'shuffle',
  options: [],
  voiceChannel: true,

  run: async (client, interaction) => {
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue) {
      return interaction.reply({
        content: 'There is no queue!',
        ephemeral: true
      }).catch(e => { })
    }

    const tracks = queue.tracks
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]]
    }
    return interaction.reply('Queue shuffled!').catch(e => { })
  }
}
