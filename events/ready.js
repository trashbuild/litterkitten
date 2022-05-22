module.exports = async (client) => {
  console.log(`${client.user.username} rises again!`)
  client.user.setActivity(client.config.playing, {
    type: 'LISTENING'
  })
  setInterval(() => {
    client.user.setActivity(client.config.playing, {
      type: 'LISTENING'
    })
  }, 600000)
}
