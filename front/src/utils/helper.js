const superagent = require('superagent')

const API_PATH = 'http://localhost:3001/api'

export async function register(payload) {
  const ret = await superagent.post(`${API_PATH}/register`).send(payload)

  return ret
}

export async function verifyEmail(id) {
  const ret = await superagent.get(`${API_PATH}/register/verify-email/${id}`)

  return ret
}
