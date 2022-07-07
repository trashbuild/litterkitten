module.exports = async (client) => {
  console.log(`\n${client.user.username} wakes from its slumber!`)
  client.user.setActivity(client.config.playing, {
    type: 'LISTENING'
  })
  setInterval(() => {
    client.user.setActivity(client.config.playing, {
      type: 'LISTENING'
    })
  }, 600000)
}
