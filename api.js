const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const { authMiddleware } = require('./middleware/auth')

const routers = require('./routers')
const db = require('./src/lib/db')

let server

async function startApi(port) {
  const app = express()

  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(cors())
  app.use(authMiddleware)

  server = app.listen(port, () => {
    console.log(`Listening on port: "${port}"`)
  })

  routers.forEach(({ path, router }) => {
    app.use(`/api/${path}`, router)
  })
}

async function stopApi() {
  db.disconnect()

  await server.close()
}

module.exports = { startApi, stopApi }
