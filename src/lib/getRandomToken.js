const crypto = require("crypto")

async function getRandomToken() {
  return crypto.randomBytes(20).toString("hex")
}

module.exports = { getRandomToken }
