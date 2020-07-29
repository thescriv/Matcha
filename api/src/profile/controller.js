const db = require('../lib/db')

const crypto = require('crypto')

const { validationUpdateProfile } = require('./schema')

async function getProfile(userId) {
  const user = await db.query(`SELECT * FROM user WHERE ?`, [{ id: userId }])

  if (!user.length) {
    throw new Error('api.profile user does_not_exist')
  }

  return user[0]
}

async function updateProfile(userId, body) {
  validationUpdateProfile(body)

  if (body.password) {
    const hashPassword = crypto
      .createHash('md5')
      .update(body.password)
      .digest('hex')

    body.password = hashPassword
  }

  const updateValueKey = Object.keys(body)

  const settingValue = updateValueKey.reduce(
    (curr, elem) => (curr += `${elem} = "${body[elem]}",`),
    ''
  )

  await db.query(
    `UPDATE user SET ${settingValue} completed = true WHERE ? AND ?`,
    [{ id: userId }, { verified: true }]
  )
}

async function likeProfile(userId, visitId) {
  const matchExist = await db.query('SELECT id FROM user_match WHERE ?', [
    { user_id_1: userId },
  ])

  if (matchExist.length) {
    throw new Error('api.profile like user_already_matched')
  }

  const userAlreadyLiked = await db.query(
    'SELECT id FROM user_like WHERE ? AND ?',
    [{ user_id_1: userId }, { user_id_2: visitId }]
  )

  if (userAlreadyLiked.length) {
    throw new Error('api.profile like user_already_liked')
  }

  const mutualLike = await db.query('SELECT id FROM user_like WHERE ? AND ?', [
    { user_id_2: userId },
    { user_id_1: visitId },
  ])

  if (mutualLike.length) {
    await db.query(
      'INSERT INTO user_match (user_id_1, user_id_2), VALUES(?, ?)',
      [userId, visitId]
    )

    await db.query('DELETE FROM user_like WHERE ? AND ?', [
      { user_id_2: userId },
      { user_id_1: visitId },
    ])

    return
  }

  await db.query('INSERT INTO user_like (user_id_1, user_id_2), VALUES(?, ?)', [
    userId,
    visitId,
  ])
}

module.exports = { getProfile, updateProfile, likeProfile }
