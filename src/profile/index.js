const express = require('express')

const jwt = require('../lib/webToken')
const db = require('../lib/db')

const {
  getProfile,
  updateProfile,
  likeProfile,
  visitProfile,
  blockProfile,
} = require('./controller')

const routerProfile = express.Router()

let userId = null
let visitId = null

routerProfile.use('/', async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.sendStatus(401)
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const tokenInfo = jwt.verify(token)

    if (!tokenInfo.user_id || !tokenInfo.logged) {
      res.status(401).send({ err: 'auth token unknow_token' })
      return
    }

    const userExist = await db.query('SELECT id FROM user WHERE ?', [
      { id: tokenInfo.user_id },
    ])

    if (!userExist.length) {
      res.status(400).send({ error: 'api.profile user does_not_exist' })
      return
    }

    userId = tokenInfo.user_id
  } catch (error) {
    res.status(400).send({ error: error.message })
    return
  }

  next()
})

routerProfile.get('/me', async (_req, res) => {
  const profileInfo = await getProfile(userId)

  res.status(200).send({ profileInfo })
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

  const visitUserExist = await db.query('SELECT id FROM user WHERE ?', [
    { id: visitId },
  ])

  if (!visitUserExist.length) {
    res.status(400).send({ err: 'api.profile userVisited does_not_exist' })
    return
  }

  const visitedUserBlockedUser = await db.query(
    `SELECT id FROM user_blocked WHERE ? AND ?`,
    [{ user_id_1: visitId }, { user_id_2: userId }]
  )

  console.log(visitId, userId)

  console.log(visitedUserBlockedUser)

  if (visitedUserBlockedUser.length) {
    res.status(400).send({ err: 'api.profile user you_have_been_blocked' })
    return
  }

  next()
})

routerProfile.post('/:visit_id', async (_req, res) => {
  //  try {
  const profileInfo = await visitProfile(userId, visitId)

  res.status(200).send({ profileInfo })
  /*   } catch (err) {
    console.error(err.message)
    res.status(400).send({ error: err.message })
  } */
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

routerProfile.post('/:visit_id/block', async (_req, res) => {
  await blockProfile(userId, visitId)

  res.sendStatus(204)
})

module.exports = { routerProfile }
