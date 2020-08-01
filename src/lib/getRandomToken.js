const crypto = require('crypto')

const db = require('./db')

async function getRandomToken (tableToken) {
    const tokens = await db.query(
        `SELECT token FROM ${tableToken}`
      )
    
      const allToken = new Set(tokens.map((elem) => elem.token))
    
      let token = null
    
      while (!token) {
        token = crypto.randomBytes(20).toString('hex')
        if (allToken.has(token)) {
          token = null
        }
      }

      return token
}

module.exports = { getRandomToken }