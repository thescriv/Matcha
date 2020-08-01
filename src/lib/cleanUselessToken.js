const db = require('./db')

async function cleanUselessToken() {
  const twoWeekFromNow = Date.now() - 60000

  const deleteToken = await db.query(
    `SELECT token FROM password_reset_token WHERE creation_date = "${twoWeekFromNow}"`
  )

  for (const { token } in deleteToken) {
    await db.query(`DELETE FROM password_reset_token WHERE token = ${token}`)
  }
}

module.exports = { cleanUselessToken }
