module.exports = async (client) => {
  console.log(`\n${client.user.username} wakes from its slumber!\n`)
  client.user.setActivity('a bug', { type: 'WATCHING' })
}
