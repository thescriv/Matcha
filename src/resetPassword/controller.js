const crypto = require('crypto')

const db = require('../lib/db')
const config = require('../../config')

const { transporter } = require('../lib/transporter')
const { getRandomToken } = require('../lib/getRandomToken')

async function sendResetPassword(body) {
  //validation

  const { email } = body

  const [user] = await db.query(`SELECT id FROM user WHERE ?`, [{ email }])

  if (!user.length) {
    throw new Error('api.resetPassword user does_not_exist')
  }

  const userId = user[0].id

  const token = await getRandomToken('password_reset_token')

  const mailConfig = {
    from: config.EMAIL_MATCHA,
    to: email,
    subject: 'Matcha - Reset Password',
    text: `Click on the link below to update your password: ${config.API_URL}/api/reset_password/${token}`,
    html: `<h3>Click on the link below to update your password:</h3> <a href="${config.API_URL}/api/reset_password/${token}><button>Reset my password</button></a>`,
  }

  const emailRet = await transporter.sendMail(mailConfig)

  if (!emailRet) {
    throw new Error('api.resetPassword sendMail failed')
  }

  await db.query(
    `INSERT INTO password_reset_token (user_id, token, creation_date) VALUES (?, ?, ?)`,
    [userId, token, Date.now()]
  )
}

async function updatePassword(body, tokenId) {
  //validation

  const { password } = body

  const [user] = await db.query(
    `SELECT user.id FROM password_reset_token INNER JOIN user ON password_reset_token.user_id = user.id WHERE token = ${tokenId}`
  )

  if (!user.length) {
    await db.query(`DELETE FROM password_reset_token WHERE ?`, [
      { token: tokenId },
    ])

    throw new Error('api.resetPassword token does_not_exist')
  }

  const userId = user[0].id

  const hashPassowrd = crypto
    .createHash('md5')
    .update(password)
    .digest('hex')

  await db.query(`UPDATE user SET ? WHERE ?`, [
    { password: hashPassowrd },
    { id: userId },
  ])
}

module.exports = { sendResetPassword, updatePassword }
