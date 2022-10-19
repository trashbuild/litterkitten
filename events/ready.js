module.exports = {
  once: true,
  execute(client) {
    console.log(`\n${client.user.username} is in here now\n`)
    client.user.setActivity('a bug', { type: 'WATCHING' })
  }
}
