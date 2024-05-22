const sounds = require('../kitten-sounds.js')
const config = require('../config.json')

module.exports = {
  execute(interaction) {
    // First and foremost, acknowledge the funny number
    if (interaction.content.includes('69')) {
      interaction.react('<:NICE:466837748263682059>')
    }

    // Respond if pinged
    if (interaction.mentions.has(interaction.client.user.id)) {
      interaction.channel.send(sounds.yes())
    }

    // Ignore bots (including self)
    if (interaction.author.bot) return

    // Check for poetry
    if (config.poeit) {
      fetch(config.poeit, {
        method: 'POST',
        headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: interaction.content
        })
      })
        .then((response) => response.json())
        .then((data) => {
          switch (data.form) {
            case 'unknown form':
              break
            case 'ballad stanza':
              interaction.react('🎵')
              break
            case 'cinquain':
              interaction.react('🖐️')
              break
            case 'haiku':
            case 'tanka':
              interaction.react('🗻')
              break
            // iambic pentameter
            // case 'blank verse':
            case 'heroic couplets':
            case 'alternate rhyme':
            case 'Shakespearean sonnet':
            case 'sonnet with unusual meter':
              interaction.react('💀')
              break
            case 'limerick':
              interaction.react('🍀')
              break
            case 'ottava rima':
              interaction.react('🍝')
              break
            case 'rondeau':
              interaction.react('🥐')
              break
            case 'tetractys':
              interaction.react('🔺')
              break
          }
        })
        .catch(e => console.log(e))
    }

    // // Handle DMs
    // if (int.channel.type === 'DM') {
    //   console.log(int.content)
    //   int.reply('Hello!')
    // }

    // // Parse arguments and check for prefix
    // const args = interaction.content.split(' ')
    // if (args.shift() !== client.config.prefix) return

    // // Check that command exists
    // const command = client.commands.get(args.shift())
    // if (!command) {
    //   return interaction.reply({
    //     content: sounds.confused(),
    //     ephemeral: true
    //   })
    // }

    // // Trigger command directly
    // interaction.args = args
    // interaction.silent = false
    // interaction.user = interaction.author
    // console.log(`Running message command: ${command.name} ${args.join(' ')}`)
    // command.execute(interaction)
  }
}
