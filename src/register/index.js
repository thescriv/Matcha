const express = require("express")

const { register, verifyEmail } = require("./controller")

const routerRegister = express.Router()

routerRegister.post("/", async (req, res) => {
  const { body } = req

  try {
    const token = await register(body)

    res.status(200).send(token)
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
})

routerRegister.get("/verify-email/:id", async (req, res) => {
  const { id } = req.params

  try {
    await verifyEmail(id)

    res.sendStatus(204)
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
})

module.exports = { routerRegister }
