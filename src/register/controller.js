const crypto = require('crypto')

const db = require('../lib/db')
const config = require('../../config')

const { validationRegister } = require('./schema')
const { transporter } = require('../lib/transporter')
const { getRandomToken } = require('../lib/getRandomToken')

async function register(body) {
  validationRegister(body)

  const { nickname, firstname, lastname, email, password } = body

  const hashPassowrd = crypto
    .createHash('md5')
    .update(password)
    .digest('hex')

  let userId

  try {
    const [{insertId}] = await db.query(
      `INSERT INTO user (nickname, firstname, lastname, email, password) 
      VALUES (?, ?, ?, ?, ?)`,
      [nickname, firstname, lastname, email, hashPassowrd]
    )

    userId = insertId
  } catch (err) {
    if (err.errno === 1062) {
      const keyDuplication = err.message.split('key')[1]

      throw new Error(`api.register ${keyDuplication} already_exist`)
    }
    throw new Error(err)
  }

  const token = await getRandomToken('register_token')

  const mailConfig = {
    from: config.EMAIL_MATCHA,
    to: email,
    subject: 'Matcha - Email Verification',
    text: `Click on the link below to verify your email: ${config.API_URL}/api/register/verify-email/${token}`,
    html: `<h3>Click on the link below to verify your email:</h3> <a href="http://${config.API_URL}/verify-email/${token}"><button>Verify</button></a>`,
  }

  const emailRet = await transporter.sendMail(mailConfig)

  if (!emailRet) {
    await db.query(`DELETE FROM user WHERE ?`, [{ id: userId }])

    throw new Error('api.register sendMail failed')
  }

  await db.query(
    `INSERT INTO register_token (user_id, token, creation_date) VALUES (?, ?, ?)`,
    [userId, token, Date.now()]
  )
}

async function verifyEmail(tokenId) {
  const [checkToken] = await db.query(
    `SELECT user_id FROM register_token WHERE ?`,
    [{ token: tokenId }]
  )

  if (!checkToken.length) {
    throw new Error('api.verifyEmail tokenId does_not_exist')
  }

  const userId = checkToken[0].user_id

  await db.query(`UPDATE user SET verified = true WHERE ?`, [{id: userId}])

  await db.query(`DELETE FROM register_token WHERE ?`, [{token: tokenId}])
}

module.exports = { register, verifyEmail }
