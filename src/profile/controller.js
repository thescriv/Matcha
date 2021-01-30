const createError = require('http-errors')
const crypto = require('crypto')

const db = require('../lib/db')

const { validationUpdateProfile } = require('./schema')

async function getProfile(req, res) {
  const {
    auth: { userId },
  } = req

  console.log(userId)

  const [user] = await db.query(`SELECT * FROM user WHERE ?`, [{ id: userId }])

  console.log(user)

  res.status(200).send({ user: user[0] })
}

async function updateProfile(req, res) {
  const { auth, body } = req

  const userId = auth

  await validationUpdateProfile(body)

  if (body.password) {
    const hashPassword = crypto
      .createHash('md5')
      .update(body.password)
      .digest('hex')

    body.password = hashPassword
  }

  await db.query(`UPDATE user SET ? WHERE ? AND ?`, [
    { ...body, completed: true },
    { id: userId },
    { verified: true },
  ])

  res.sendStatus(204)
}

async function getVisitedUser(req, res) {
  const { auth: userId } = req

  const [visitedUser] = await db.query(
    'SELECT user.nickname from user INNER JOIN user_visit ON user.id = user_visit.user_id_1 WHERE ? LIMIT 5',
    [{ 'user_visit.user_id_2': userId }]
  )

  res.status(200).send(visitedUser)
}

async function getLikedUser(req, res) {
  const { auth: userId } = req

  const [likedUser] = await db.query(
    'SELECT user.nickname from user INNER JOIN user_like ON user.id = user_visit.user_id_1 WHERE ? LIMIT 5',
    [{ 'user_visit.user_id_2': userId }]
  )

  res.status(200).send(likedUser)
}

async function visitProfile(req, res) {
  const { auth } = req

  const { visitId } = auth

  const [userVisited] = await db.query(`SELECT * FROM user WHERE ?`, [
    { id: visitId },
  ])

  res.status(200).send({ user: userVisited[0] })
}

async function likeProfile(req, res) {
  const { auth } = req

  const { userId, visitId } = auth

  const [[matchExist], [userAlreadyLiked]] = await Promise.all([
    db.query('SELECT id FROM user_match WHERE (? OR ?) AND (? OR ?)', [
      { user_id_1: userId },
      { user_id_2: userId },
      { user_id_2: visitId },
      { user_id_1: visitId },
    ]),
    db.query('SELECT id FROM user_like WHERE ? AND ?', [
      { user_id_1: userId },
      { user_id_2: visitId },
    ]),
  ])

  if (matchExist.length || userAlreadyLiked.length) {
    throw createError(
      400,
      `api.profile like user_already_${matchExist.length ? 'matched' : 'liked'}`
    )
  }

  const [mutualLike] = await db.query('SELECT id FROM user_like WHERE ? AND ?', [
    { user_id_2: userId },
    { user_id_1: visitId },
  ])

  if (mutualLike.length) {
    await db.query(
      'INSERT INTO user_match (user_id_1, user_id_2) VALUES(?, ?)',
      [userId, visitId]
    )

    await db.query('DELETE FROM user_like WHERE ? AND ?', [
      { user_id_2: userId },
      { user_id_1: visitId },
    ])

    return
  } else {
    await db.query(
      'INSERT INTO user_like (user_id_1, user_id_2) VALUES(?, ?)',
      [userId, visitId]
    )
  }

  res.sendStatus(204)
}

async function blockProfile(req, res) {
  const { auth } = req

  const { userId, visitId } = auth
  const [alreadyBlocked] = await db.query(
    'SELECT id FROM user_blocked WHERE ? AND ?',
    [{ user_id_1: userId }, { user_id_2: visitId }]
  )

  if (alreadyBlocked.length) {
    await db.query('DELETE FROM user_blocked WHERE ? AND ?', [
      { user_id_1: userId },
      { user_id_2: visitId },
    ])

    res.sendStatus(204)
  }

  await db.query(
    'INSERT INTO user_blocked (user_id_1, user_id_2) VALUES(?, ?)',
    [userId, visitId]
  )

  await Promise.all([
    db.query('DELETE * FROM user_visit WHERE (? AND ?) OR (? AND ?)', [
      { user_id_1: userId },
      { user_id_2: visitId },
      { user_id_1: visitId },
      { user_id_2: UserId },
    ]),
    db.query('DELETE * FROM user_like WHERE (? AND ?) OR (? AND ?)', [
      { user_id_1: userId },
      { user_id_2: visitId },
      { user_id_1: visitId },
      { user_id_2: UserId },
    ]),
    db.query('DELETE * FROM user_match WHERE (? AND ?) OR (? AND ?)', [
      { user_id_1: userId },
      { user_id_2: visitId },
      { user_id_1: visitId },
      { user_id_2: UserId },
    ]),
  ])

  res.sendStatus(204)
}

async function flagProfile(req, res) {
  const {
    auth: { visitId },
  } = req
  await db.query(
    `INSERT INTO user_flaged (user_id, flag_count) VALUES (?, ?) ON DUPLICATE KEY UPDATE flag_count = flag_count + 1`,
    [visitId, 1]
  )

  res.sendStatus(204)
}

module.exports = {
  getProfile,
  updateProfile,
  likeProfile,
  visitProfile,
  blockProfile,
  flagProfile,
  getVisitedUser,
  getLikedUser,
}
