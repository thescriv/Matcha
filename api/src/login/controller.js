const crypto = require('crypto')

const db = require('../lib/db')
const jwt = require('../lib/webToken')

const { validationLogin } = require('./schema')

async function login(body) {
  validationLogin(body)

  const { nickname, password } = body

  const hashPassowrd = crypto
    .createHash('md5')
    .update(password)
    .digest('hex')

  const user = await db.query(`SELECT ? from user WHERE ? AND ?`, [
    'id',
    { nickname: nickname },
    { password: hashPassowrd },
  ])

  if (!user.length) {
    throw new Error(`api.login user does_not_exist`)
  }

  const token = jwt.generate(user[0].id)

  if (!token) {
    throw new Error('api.login token failed_to_generate_token')
  }

  return token
}

module.exports = { login }
