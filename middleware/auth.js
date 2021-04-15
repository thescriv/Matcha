const createError = require("http-errors")

const jwt = require("../src/lib/webToken")

function authMiddleware(req, res, next) {
  req.auth = {
    userId: null,
    visitId: null,
    logged: false,
    isAdmin: false,
    token: null,
  }

  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(" ")[1]

    try {
      req.auth.token = jwt.verify(token)
      console.log(req.auth.token)
    } catch (err) {
      throw createError(400, err.message)
    }

    if (!req.auth.token.user_id || !req.auth.token.logged) {
      console.log("unkown")
      throw createError(401, "api.auth token unknow_token")
    }

    req.auth.logged = true

    if (req.auth.token.roles.some((elem) => elem === "admin")) {
      req.auth.isAdmin = true
    }

    req.auth.userId = parseInt(req.auth.token.user_id)

    if (req.params && req.params.visit_id) {
      req.auth.visitId = parseInt(visit_id)

      if (req.auth.userId === req.auth.visitId) {
        throw createError(500, "illegal action")
      }
    }
  }

  try {
    next()
  } catch (err) {
    console.error(err)
    res.status(400).send({ error: err.message })
  }
}

module.exports = { authMiddleware }
