const { MessageEmbed } = require('discord.js')
module.exports = (client, int) => {
  if (!int.guild) return

  if (int.isCommand()) {
    const cmd = client.commands.get(int.commandName)

    if (!cmd) {
      return int.reply({
        content: `Command "${int.commandName}" not found.`,
        ephemeral: true
      })
    }

    if (cmd.voiceChannel) {
      if (!int.member.voice.channel) {
        return int.reply({
          content: 'You are not connected to an audio channel.',
          ephemeral: true
        })
      }
      if (int.guild.me.voice.channel &&
        int.member.voice.channel.id !== int.guild.me.voice.channel.id) {
        return int.reply({
          content: 'You are not on the same audio channel as me.',
          ephemeral: true
        })
      }
    }

    int.args = []
    int.options.data.forEach((option) => {
      int.args.push(option.value)
    })

    cmd.run(client, int)
  }

  if (int.isButton()) {
    const queue = client.player.getQueue(int.guildId)
    switch (int.customId) {
      case 'saveTrack': {
        if (!queue || !queue.playing) {
          return int.reply({
            content: 'No music currently playing.',
            ephemeral: true,
            components: []
          })
        } else {
          const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle(client.user.username + ' - Save Track')
            .setThumbnail(client.user.displayAvatarURL())
            .addField('Track', `\`${queue.current.title}\``)
            .addField('Duration', `\`${queue.current.duration}\``)
            .addField('URL', `${queue.current.url}`)
            .addField('Saved Server', `\`${int.guild.name}\``)
            .addField('Requested By', `${queue.current.requestedBy}`)
            .setTimestamp()
          int.member.send({ embeds: [embed] }).then(() => {
            return int.reply({
              content: 'I sent you the name of the song in a private message',
              ephemeral: true
            }).catch(e => { })
          }).catch(e => {
            return int.reply({
              content: 'I can\'t send you a private message.',
              ephemeral: true
            }).catch(e => { })
          })
        }
        break
      }
      case 'time': {
        if (!queue || !queue.playing) {
          return int.reply({
            content: 'No music currently playing.',
            ephemeral: true,
            components: []
          })
        } else {
          const progress = queue.createProgressBar()
          const timestamp = queue.getPlayerTimestamp()

          if (timestamp.progress === 'Infinity') {
            return int.message.edit({
              content: 'This song is live streaming. 🎧'
            }).catch(e => { })
          }

          const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle(queue.current.title)
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(`${progress} (**${timestamp.progress}**%)`)
          int.message.edit({ embeds: [embed] }).catch(e => { })
          int.reply({
            content: '**✅ Success:** Time data updated. ',
            ephemeral: true
          }).catch(e => { })
        }
      }
    }
  }
}
