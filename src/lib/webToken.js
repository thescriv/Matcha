const jwt = require('jsonwebtoken')

const config = require('../../config')

function generate(id) {
  if (!id) {
    throw new Error('api.generateWT user_id is_null')
  }

  const token = jwt.sign(
    { auth: ['user'], user_id: id, logged: true },
    config.SECRET_KEY,
    {
      expiresIn: '1h',
    }
  )

  if (!token) {
    throw new Error('api.generateWT token cannot_be_generated')
  }

  return token
}

function verify(token) {
  if (!token) {
    throw new Error('api.generateWT token is_null')
  }

  let payload

  try {
    payload = jwt.verify(token, config.SECRET_KEY)
  } catch (err) {
    throw new Error('api.generateWT token is_not_valid')
  }

  if (!payload) {
    throw new Error('api.generateWT token content_is_null')
  }

  if (!payload.logged) {
    throw new Error('api.generateWT token user_is_not_logged')
  }

  return payload
}

function logout(id) {
  if (!id) {
    throw new Error('api.generateWT user_id is_null')
  }

  const tokenLogout = jwt.sign(
    { auth: ['user'], user_id: id, logged: false },
    config.SECRET_KEY
  )

  if (!tokenLogout) {
    throw new Error('api.generateWT token cannot_be_generated')
  }

  return tokenLogout
}

module.exports = { generate, verify, logout }
