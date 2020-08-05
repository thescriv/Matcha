const createError = require('http-errors')

async function authMiddleware(req, _res, next) {
  req.auth = {
    userId: null,
    visitId: null,
    logged: null,
    roles: null,
    isAdmin: null,
    assertUser: null,
    assertAuth: null,
    assertAdmin: null,
    assertVisit: null,
    token: null,
  }

  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    try {
      req.token = jwt.verify(token)
    } catch (error) {
      throw createError(400, error.message)
    }

    if (!req.token.user_id || !req.token.logged) {
      throw createError(401, 'api.auth token unknow_token')
    }

    const userExist = await db.query('SELECT id FROM user WHERE ?', [
      { id: req.token.user_id },
    ])

    if (!userExist.length) {
      throw createError(403, 'api.auth user does_not_exist')
    }

    req.userId = req.token.user_id

    const {
      params: { visit_id },
    } = req

    if (visit_id) {
      req.visitId = parseInt(visit_id)
    }

    req.assertUser = () => {
      if (!userId) {
        throw createError(403, 'api.auth user is_not_set')
      }
    }

    req.assertAuth = () => {
      if (!req.token) {
        throw createError(403, 'api.auth token is_not_provided')
      }
    }

    req.assertVisit = async () => {
      if (req.userId === req.visitId) {
        throw createError(500, 'illegal action')
      }

      const visitUserExist = await db.query('SELECT id FROM user WHERE ?', [
        { id: req.visitId },
      ])

      if (!visitUserExist.length) {
        throw createError(400, 'api.auth.visit userVisited does_not_exist')
      }

      const visitedUserBlockedUser = await db.query(
        `SELECT id FROM user_blocked WHERE ? AND ?`,
        [{ user_id_1: req.visitId }, { user_id_2: req.userId }]
      )

      if (visitedUserBlockedUser.length) {
        throw createError(400, 'api.profile userVisited blocked_you')
      }

      const userBlockedVisitedUser = await db.query(
        `SELECT id FROM user_blocked WHERE ? AND ?`,
        [{ user_id_1: req.userId }, { user_id_2: req.visitId }]
      )

      if (userBlockedVisitedUser.length) {
        throw createError(400, 'api.profile user user_is_blocked')
      }
    }
  }

  await next()
}

module.exports = { authMiddleware }
