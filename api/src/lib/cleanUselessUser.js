const db = require('./db')

async function cleanUselessUser() {
  const twoWeekFromNow = Date.now() - 60000

  const deleteUser = await db.query(
    `SELECT user_id FROM register_token WHERE creation_date = "${twoWeekFromNow}"`
  )

  for (const { user_id: userId } in deleteUser) {
    await db.query(`DELETE FROM user WHERE id = ${userId}`)

    await db.query(`DELETE FROM register_token WHERE user_id = ${userId}`)
  }
}

module.exports = { cleanUselessUser }
