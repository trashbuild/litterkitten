const sounds = require('../kitten-sounds.js')
const { MessageEmbed } = require('discord.js')

module.exports = (client, interaction) => {
  // Verify server
  if (!interaction.guild) return

  // Handle slash commands
  if (interaction.isCommand()) {
    // Verify command
    const command = client.commands.get(interaction.commandName)
    if (!command) {
      return interaction.reply({
        content: sounds.confused(),
        ephemeral: true
      })
    }

    // Verify user is in same voice channel as bot
    if (command.voiceChannel) {
      if (!interaction.member.voice.channel || (
        interaction.guild.me.voice.channel &&
        interaction.member.voice.channel.id !== interaction.guild.me.voice.channel.id
      )) {
        return interaction.reply({
          content: `${sounds.confused()} :microphone:`,
          ephemeral: true
        })
      }
    }

    // Turn options into args for compatibility with message commands
    interaction.args = []
    interaction.options.data.forEach((option) => {
      interaction.args.push(option.value)
    })
    interaction.silent = false

    // Do command
    console.log(`Running slash command: ${interaction.commandName}`)
    command.run(client, interaction)
  }

  // Handle buttons
  if (interaction.isButton()) {
    const queue = client.player.getQueue(interaction.guildId)
    switch (interaction.customId) {
      case 'saveTrack': {
        if (!queue || !queue.playing) {
          return interaction.reply({
            content: `${sounds.confused()} :question::speaker::question:`,
            ephemeral: true,
            components: []
          })
        } else {
          const embed = new MessageEmbed()
            .setColor(client.config.color)
            .setTitle('Saved track')
            .setThumbnail(client.user.displayAvatarURL())
            .addField('Track', `\`${queue.current.title}\``)
            .addField('Duration', `\`${queue.current.duration}\``)
            .addField('URL', `${queue.current.url}`)
            .addField('Saved Server', `\`${interaction.guild.name}\``)
            .addField('Requested By', `${queue.current.requestedBy}`)
            .setTimestamp()
          interaction.member.send({ embeds: [embed] }).then(() => {
            return interaction.reply({
              content: `${sounds.yes()} :white_check_mark:`,
              ephemeral: true
            }).catch(e => { })
          }).catch(e => {
            return interaction.reply({
              content: `${sounds.confused()} :x::incoming_envelope::x:`,
              ephemeral: true
            }).catch(e => { })
          })
        }
        break
      }
      case 'time': {
        if (!queue || !queue.playing) {
          return interaction.reply({
            content: `${sounds.no()} :x::zero::musical_note:`,
            ephemeral: true,
            components: []
          })
        } else {
          const progress = queue.createProgressBar()
          const timestamp = queue.getPlayerTimestamp()

          if (timestamp.progress === 'Infinity') {
            return interaction.message.edit({
              content: ':infinity:'
            }).catch(e => { })
          }

          const embed = new MessageEmbed()
            .setColor(client.config.color)
            .setTitle(queue.current.title)
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(`${progress} (**${timestamp.progress}**%)`)
          interaction.message.edit({ embeds: [embed] }).catch(e => { })
        }
      }
    }
  }
}
