const express = require('express')

const { login } = require('../login/controller')

const routerLogin = express.Router()

routerLogin.post('/', async (req, res) => {
  const { body } = req

  try {
    const token = await login(body)

    res.header('Authorization', `Bearer ${token}`)

    res.sendStatus(204)
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
})

module.exports = { routerLogin }
