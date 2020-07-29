const express = require('express')

const { sendResetPassword, updatePassword } = require('./controller')

const routerResetPassword = express.Router()

routerResetPassword.use('/', (_req, _res, next) => {
  next()
})

routerResetPassword.post('/', async (req, res) => {
  const { body } = req

  try {
    await sendResetPassword(body)

    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(400).send({ error: err.message })
  }
})

routerResetPassword.post('/:tokenId', async (req, res) => {
  const {
    body,
    params: { tokenId },
  } = req

  try {
    await updatePassword(body, tokenId)

    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(400).send({ error: err.message })
  }
})

module.exports = { routerResetPassword }
