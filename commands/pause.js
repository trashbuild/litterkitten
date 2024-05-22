// const sounds = require('../kitten-sounds.js')
const { SlashCommandBuilder } = require('discord.js')
const { useMainPlayer } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause music without closing the player.'),

  async execute(interaction) {
    const node = useMainPlayer().queues.get(interaction.guild).node
    node.setPaused(!node.isPaused())
  }
}
