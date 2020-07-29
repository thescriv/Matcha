const crypto = require('crypto')
const superagent = require('superagent')
const webToken = require('jsonwebtoken')

const db = require('../src/lib/db')
const jwt = require('../src/lib/webToken')

const { script } = require('../scripts/script')
const { deleteRows } = require('./utils/deleteRows')
const { getRandomPort } = require('./utils/getRandomPort')
const { startApi, stopApi } = require('../api')

let baseUrl

describe(`login -- `, () => {
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

  describe('POST /login', () => {
    beforeEach(async () => {
      const hashPassword = crypto
        .createHash('md5')
        .update('testTest1')
        .digest('hex')

      await db.query(
        `INSERT INTO user (nickname, password) VALUES ("thescriv1", "${hashPassword}")`
      )
    })

    test('do login', async () => {
      const { body, status } = await superagent.post(`${baseUrl}/login`).send({
        nickname: 'thescriv1',
        password: 'testTest1',
      })

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not login (nickname is null)', async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/login`).send({
          nickname: null,
          password: 'testTest1',
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not login (password is null)', async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/login`).send({
          nickname: 'thescriv1',
          password: null,
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not login (password is wrong)', async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/login`).send({
          nickname: 'thescriv1',
          password: 'test',
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not login (user does not exist)', async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/login`).send({
          nickname: 'thescriv',
          password: 'testTest1',
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not login (failed to create token)', async () => {
      jest.spyOn(jwt, 'generate').mockReturnValue(false)

      let error

      try {
        await superagent.post(`${baseUrl}/login`).send({
          nickname: 'thescriv1',
          password: 'testTest1',
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test('do not login (token fail to sign)', async () => {
      jest.spyOn(webToken, 'sign').mockReturnValue(false)

      let error

      try {
        await superagent.post(`${baseUrl}/login`).send({
          nickname: 'thescriv1',
          password: 'testTest1',
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })
  })
})
