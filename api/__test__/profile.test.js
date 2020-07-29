const superagent = require('superagent')
const webToken = require('jsonwebtoken')
const crypto = require('crypto')

const db = require('../src/lib/db')
const jwt = require('../src/lib/webToken')
const config = require('../../../config')

const { script } = require('../scripts/script')
const { deleteRows } = require('./utils/deleteRows')
const { getRandomPort } = require('./utils/getRandomPort')
const { startApi, stopApi } = require('../api')

let baseUrl

describe(`profile -- `, () => {
  beforeAll(async () => {
    const port = getRandomPort()

    baseUrl = `http://localhost:${port}/api`

    await script('matchaTest')

    await deleteRows()

    await startApi(port)
  })

  afterEach(async () => {
    await deleteRows()

    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await stopApi()
  })

  describe('auth', () => {
    test('do not auth (token cannot be verified)', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('api.generateWT token cannot_be_verified')
      })

      const token = jwt.generate('1')

      let error

      try {
        await superagent
          .get(`${baseUrl}/profile/`)
          .set('Authorization', `Bearer ${token}`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not auth (no token)', async () => {
      try {
        await superagent.get(`${baseUrl}/profile/`)
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not auth (user is not logged)', async () => {
      const token = webToken.sign(
        { auth: ['user'], user_id: '1', logged: false },
        config.SECRET_KEY,
        {
          expiresIn: '1h',
        }
      )

      let error

      try {
        await superagent
          .get(`${baseUrl}/profile/`)
          .set('Authorization', `Bearer ${token}`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not auth (no user_id in token)', async () => {
      const token = webToken.sign(
        { auth: ['user'], logged: true },
        config.SECRET_KEY,
        {
          expiresIn: '1h',
        }
      )

      let error

      try {
        await superagent
          .get(`${baseUrl}/profile/`)
          .set('Authorization', `Bearer ${token}`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not auth (no logged in token)', async () => {
      const token = webToken.sign(
        { auth: ['user'], user_id: '1' },
        config.SECRET_KEY,
        {
          expiresIn: '1h',
        }
      )

      let error

      try {
        await superagent
          .get(`${baseUrl}/profile/`)
          .set('Authorization', `Bearer ${token}`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })
  })

  describe('GET /profile/me', () => {
    test('do get me', async () => {
      const insertedUser = await db.query(
        `INSERT INTO user (firstname, lastname, email, password) 
              VALUES ("theo", "test", "test@test.test", "f94b937b40c946b916c63a1b638ee956")`
      )

      const token = jwt.generate(insertedUser.insertId)

      const { body, status } = await superagent
        .get(`${baseUrl}/profile/me`)
        .set('Authorization', `Bearer ${token}`)

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not get me (user does not exist)', async () => {
      const token = jwt.generate('1')

      let error

      try {
        await superagent
          .get(`${baseUrl}/profile/me`)
          .set('Authorization', `Bearer ${token}`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })
  })

  describe('GET /profile/logout', () => {
    test('do logout', async () => {
      const token = jwt.generate('1')

      const { body, status } = await superagent
        .get(`${baseUrl}/profile/logout`)
        .set('Authorization', `Bearer ${token}`)

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not logout (jwt.logout throw)', async () => {
      jest.spyOn(jwt, 'logout').mockImplementation(() => {
        throw new Error('api.generateWT token cannot_be_generated')
      })
      const token = jwt.generate('1')

      try {
        await superagent
          .get(`${baseUrl}/profile/logout`)
          .set('Authorization', `Bearer ${token}`)
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })
  })

  describe('POST /profile/update', () => {
    let token

    let userId

    beforeEach(async () => {
      const insertedUser = await db.query(
        `INSERT INTO user (nickname, firstname, lastname, email, password, verified) 
              VALUES ("thescriv", "theo", "test", "test@test.test", "f94b937b40c946b916c63a1b638ee956", true)`
      )

      userId = insertedUser.insertId

      token = jwt.generate(userId)
    })

    test('do update profile', async () => {
      const { body, status } = await superagent
        .post(`${baseUrl}/profile/update`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstname: 'Jack' })

      expect({ body, status }).toMatchSnapshot()

      const user = await db.query('SELECT * FROM user')
      expect(user).toMatchSnapshot()
    })

    test('do update profile (password modified)', async () => {
      jest
        .spyOn(crypto, 'randomBytes')
        .mockReturnValue('0000000000000000000000000000000000000001')

      const { body, status } = await superagent
        .post(`${baseUrl}/profile/update`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstname: 'Jack', password: 'Thescriv1' })

      expect({ body, status }).toMatchSnapshot()

      const user = await db.query('SELECT * FROM user')
      expect(user).toMatchSnapshot()
    })

    test('do not update profile (no token send)', async () => {
      let error

      try {
        await superagent
          .post(`${baseUrl}/profile/update`)
          .send({ firstname: 'Jack' })
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const user = await db.query('SELECT * FROM user')
      expect(user).toMatchSnapshot()
    })

    test('do not update profile (user does not exist)', async () => {
      await db.query(`DELETE FROM user WHERE id = ${userId}`)

      let error

      try {
        await superagent
          .post(`${baseUrl}/profile/update`)
          .set('Authorization', `Bearer ${token}`)
          .send({ firstname: 'Jack' })
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const user = await db.query('SELECT * FROM user')
      expect(user).toMatchSnapshot()
    })
  })
})
