const db = require('../lib/db')

const crypto = require('crypto')

const { validationUpdateProfile } = require('./schema')

async function getProfile(userId) {
  const user = await db.query(`SELECT * FROM user WHERE ?`, [{ id: userId }])

  return user[0]
}

async function visitProfile(userId, visitId) {
  const userVisited = await db.query(`SELECT * FROM user WHERE ?`, [
    { id: visitId },
  ])

  return userVisited[0]
}

async function updateProfile(userId, body) {
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
}

async function likeProfile(userId, visitId) {
  const [matchExist, userAlreadyLiked] = [
    await db.query('SELECT id FROM user_match WHERE (? OR ?) AND (? OR ?)', [
      { user_id_1: userId },
      { user_id_2: userId },
      { user_id_2: visitId },
      { user_id_1: visitId },
    ]),
    await db.query('SELECT id FROM user_like WHERE ? AND ?', [
      { user_id_1: userId },
      { user_id_2: visitId },
    ]),
  ]

  if (matchExist.length || userAlreadyLiked.length) {
    throw new Error(
      `api.profile like user_already_${matchExist.length ? 'matched' : 'liked'}`
    )
  }

  const mutualLike = await db.query('SELECT id FROM user_like WHERE ? AND ?', [
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
  }

  await db.query('INSERT INTO user_like (user_id_1, user_id_2) VALUES(?, ?)', [
    userId,
    visitId,
  ])
}

async function blockProfile(userId, visitId) {
  const alreadyBlocked = await db.query(
    'SELECT id FROM user_blocked WHERE ? AND ?',
    [{ user_id_1: userId }, { user_id_2: visitId }]
  )

  if (alreadyBlocked.length) {
    await db.query('DELETE FROM user_blocked WHERE ? AND ?', [
      { user_id_1: userId },
      { user_id_2: visitId },
    ])

    return
  }

  await db.query(
    'INSERT INTO user_blocked (user_id_1, user_id_2) VALUES(?, ?)',
    [userId, visitId]
  )
}

module.exports = {
  getProfile,
  updateProfile,
  likeProfile,
  visitProfile,
  blockProfile,
}
