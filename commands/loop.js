const { QueueRepeatMode } = require('discord-player')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
module.exports = {
  description: 'Toggle loop mode.',
  name: 'loop',
  options: [],
  voiceChannel: true,
  run: async (client, interaction) => {
    // Ensure queue exists and is playing
    const queue = client.player.getQueue(interaction.guild.id)
    if (!queue || !queue.playing) {
      return interaction.reply({
        content: 'There is no music currently playing!',
        ephemeral: true
      }).catch(e => { })
    }

    // Create button
    const button = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel('Loop')
        .setStyle('SUCCESS')
        .setCustomId('loop')
    )

    // Create embed
    const embed = new MessageEmbed()
      .setColor('BLUE')
      .setTitle('Loop System')
      .setDescription(`**${queue.current.title}** is now looping.`)
      .setTimestamp()

    // Reply
    interaction.reply({
      embeds: [embed],
      components: [button]
    }).then(async Message => {
      const filter = i => i.user.id === interaction.user.id
      const col = await interaction.channel.createMessageComponentCollector(
        { filter, time: 60000 }
      )
      col.on('collect', async (button) => {
        if (button.user.id !== interaction.user.id) return
        if (button.customId === 'loop') {
          if (queue.repeatMode === 1) {
            return interaction.reply({
              content: 'You should disable loop mode first',
              ephemeral: true
            }).catch(e => { })
          }
          const success = queue.setRepeatMode(
            queue.repeatMode === 0
              ? QueueRepeatMode.QUEUE
              : QueueRepeatMode.OFF
          )
          interaction.editReply({
            content: success
              ? `Loop: **${queue.repeatMode === 0 ? 'Inactive' : 'Active'}**`
              : 'Something went wrong.'
          }).catch(e => { }).catch(e => { })
          await button.deferUpdate()
        }
      })
      col.on('end', async (button) => {
        button = new MessageActionRow().addComponents(
          new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Loop It')
            .setCustomId('loop')
            .setDisabled(true)
        )

        const embed = new MessageEmbed()
          .setColor('BLUE')
          .setTitle('Loop System - Ended')
          .setDescription('Your time is up to choose.')
          .setTimestamp()

        await interaction.editReply(
          { embeds: [embed], components: [button] }
        ).catch(e => { })
      })
    }).catch(e => { })
  }
}
