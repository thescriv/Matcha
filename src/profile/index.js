const express = require('express')

const jwt = require('../lib/webToken')
const db = require('../lib/db')

const { getProfile, updateProfile, likeProfile } = require('./controller')

const routerProfile = express.Router()

let userId = null
let visitId = null

routerProfile.use('/', (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.sendStatus(401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const tokenInfo = jwt.verify(token)

    if (!tokenInfo.user_id || !tokenInfo.logged) {
      res.status(401).send({ err: 'auth token unknow_token' })
    }

    userId = tokenInfo.user_id
  } catch (error) {
    res.status(400).send({ error: error.message })
  }

  next()
})

routerProfile.get('/me', async (_req, res) => {
  try {
    const profileInfo = await getProfile(userId)

    res.status(200).send({ profileInfo })
  } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  }
})

routerProfile.post('/update', async (req, res) => {
  const { body } = req

  try {
    await updateProfile(userId, body)

    res.sendStatus(204)
  } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  }
})

routerProfile.get('/logout', async (_req, res) => {
  try {
    const token = await jwt.logout(userId)

    res.header('Authorization', `Bearer ${token}`)

    res.sendStatus(204)
  } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  }
})

routerProfile.use('/:visit_id', async (req, res, next) => {
  const {
    params: { visit_id },
  } = req

  visitId = parseInt(visit_id)

  if (userId === visitId) {
    res.status(500).send({ error: 'illegal action' })
    return
  }

  console.log(visitId)

  const visitUserExist = await db.query('SELECT id FROM user WHERE ?', [
    { id: visitId },
  ])

  console.log(visitUserExist)

  if (!visitUserExist.length) {
    res.status(400).send({ err: 'user does not exist' })
    return 
  }

  //userIsBlocked ?

  next()
})

routerProfile.post('/:visit_id', async (_req, res) => {
  try {
    const profileInfo = await getProfile(visitId)

    res.status(200).send({ profileInfo })
  } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  }
})

routerProfile.post('/:visit_id/like', async (_req, res) => {
  try {
    await likeProfile(userId, visitId)

    res.sendStatus(204)
  } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  }
})

module.exports = { routerProfile }
