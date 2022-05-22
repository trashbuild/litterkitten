const sounds = require('../kitten-sounds.js')
const { MessageEmbed } = require('discord.js')

module.exports = (client, int) => {
  // Verify server
  if (!int.guild) return

  // Handle slash commands
  if (int.isCommand()) {
    // Verify command
    const cmd = client.commands.get(int.commandName)
    if (!cmd) {
      return int.reply({
        content: `"${int.commandName}" ${sounds.confused()}`,
        ephemeral: true
      })
    }

    // Verify user is in same voice channel as bot
    if (cmd.voiceChannel) {
      if (!int.member.voice.channel || (
        int.guild.me.voice.channel &&
        int.member.voice.channel.id !== int.guild.me.voice.channel.id
      )) {
        return int.reply({
          content: `${sounds.confused()} :question::microphone::question:`,
          ephemeral: true
        })
      }
    }

    // Turn options into args for compatibility with message commands
    int.args = []
    int.options.data.forEach((option) => {
      int.args.push(option.value)
    })
    int.silent = false

    // Do command
    cmd.run(client, int)
  }

  // Handle buttons
  if (int.isButton()) {
    const queue = client.player.getQueue(int.guildId)
    switch (int.customId) {
      case 'saveTrack': {
        if (!queue || !queue.playing) {
          return int.reply({
            content: `${sounds.confused()} :question::speaker::question:`,
            ephemeral: true,
            components: []
          })
        } else {
          const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle('Saved track')
            .setThumbnail(client.user.displayAvatarURL())
            .addField('Track', `\`${queue.current.title}\``)
            .addField('Duration', `\`${queue.current.duration}\``)
            .addField('URL', `${queue.current.url}`)
            .addField('Saved Server', `\`${int.guild.name}\``)
            .addField('Requested By', `${queue.current.requestedBy}`)
            .setTimestamp()
          int.member.send({ embeds: [embed] }).then(() => {
            return int.reply({
              content: `${sounds.yes()} :white_check_mark:`,
              ephemeral: true
            }).catch(e => { })
          }).catch(e => {
            return int.reply({
              content: `${sounds.confused()} :x::incoming_envelope::x:`,
              ephemeral: true
            }).catch(e => { })
          })
        }
        break
      }
      case 'time': {
        if (!queue || !queue.playing) {
          return int.reply({
            content: `${sounds.no()} :x::zero::musical_note:`,
            ephemeral: true,
            components: []
          })
        } else {
          const progress = queue.createProgressBar()
          const timestamp = queue.getPlayerTimestamp()

          if (timestamp.progress === 'Infinity') {
            return int.message.edit({
              content: ':infinity:'
            }).catch(e => { })
          }

          const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle(queue.current.title)
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(`${progress} (**${timestamp.progress}**%)`)
          int.message.edit({ embeds: [embed] }).catch(e => { })
        }
      }
    }
  }
}
