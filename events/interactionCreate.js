const sounds = require('../kitten-sounds.js')
const { EmbedBuilder } = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  execute(interaction) {
    const client = interaction.client

    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      // Verify command
      const command = interaction.client.commands.get(interaction.commandName)
      if (!command) return

      // Verify user is in same voice channel as bot
      if (command.voiceChannel) {
        if (!interaction.member.voice.channel || (
          interaction.guild.members.me.voice.channel &&
          interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id
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
      try {
        command.execute(interaction)
      } catch (error) {
        console.error(error)
        interaction.reply({ content: ':x:', ephemeral: true })
      }
    }

    // Handle buttons
    if (interaction.isButton()) {
      const player = useMainPlayer()
      switch (interaction.customId) {
        case 'saveTrack': {
          if (!player || !player.playing) {
            return interaction.reply({
              content: `${sounds.confused()} :question::speaker::question:`,
              ephemeral: true,
              components: []
            })
          } else {
            const embed = new EmbedBuilder()
              .setColor(interaction.guild.members.me.displayHexColor)
              .setTitle('Saved track')
              .setThumbnail(client.user.displayAvatarURL())
              .addFields(
                { name: 'Track', value: `\`${player.current.title}\`` },
                { name: 'Duration', value: `\`${player.current.duration}\`` },
                { name: 'URL', value: `${player.current.url}` },
                { name: 'Saved Server', value: `\`${interaction.guild.name}\`` },
                { name: 'Requested By', value: `${player.current.requestedBy}` }
              ).setTimestamp()
            interaction.member.send({ embeds: [embed] }).then(() => {
              return interaction.reply({
                content: `${sounds.yes()} :white_check_mark:`,
                ephemeral: true
              }).catch(e => { console.log(e) })
            }).catch(e => {
              return interaction.reply({
                content: `${sounds.confused()} :x::incoming_envelope::x:`,
                ephemeral: true
              }).catch(e => { console.log(e) })
            })
          }
          break
        }
        case 'time': {
          if (!player || !player.playing) {
            return interaction.reply({
              content: `${sounds.no()} :x::zero::musical_note:`,
              ephemeral: true,
              components: []
            })
          } else {
            const progress = player.createProgressBar()
            const timestamp = player.getPlayerTimestamp()

            if (timestamp.progress === 'Infinity') {
              return interaction.message.edit({
                content: ':infinity:'
              }).catch(e => { console.log(e) })
            }

            const embed = new EmbedBuilder()
              .setColor(interaction.guild.members.me.displayHexColor)
              .setTitle(player.current.title)
              .setThumbnail(client.user.displayAvatarURL())
              .setTimestamp()
              .setDescription(`${progress} (**${timestamp.progress}**%)`)
            interaction.message.edit({ embeds: [embed] }).catch(e => { })
          }
        }
      }
    }
  }
}
