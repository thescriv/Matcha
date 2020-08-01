const express = require('express')

const { register, verifyEmail } = require('./controller')

const routerRegister = express.Router()

routerRegister.use('/', (req, res, next) => {
  next()
})

routerRegister.post('/', async (req, res) => {
  const { body } = req

  try {
    await register(body)

    res.sendStatus(204)
  } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  }
})

routerRegister.get('/verify-email/:id', async (req, res) => {
  const { id } = req.params

  try {
    await verifyEmail(id)

    res.sendStatus(204)
  } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  }
})

module.exports = { routerRegister }