const express = require('express')

const jwt = require('../lib/webToken')
const db = require('../lib/db')

const {
  getProfile,
  updateProfile,
  likeProfile,
  visitProfile,
  blockProfile,
  flagProfile,
  getVisitedUser,
  getLikedUser
} = require('./controller')

const routerProfile = express.Router()

let userId = null
let visitId = null

routerProfile.get('/me', getProfile)

routerProfile.post('/update', updateProfile)

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

routerProfile.get('/visited_user', getVisitedUser)

routerProfile.get('/liked_user', getLikedUser)


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

routerProfile.post('/:visit_id/flag', async (_req, res) => {
  await flagProfile(visitId)

  res.sendStatus(204)
})

module.exports = { routerProfile }
