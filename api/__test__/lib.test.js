const crypto = require('crypto')
const db = require('../src/lib/db')

const { initializationDB } = require('../scripts/initializationDB')
const { initializationTables } = require('../scripts/initializationTables')

const webToken = require('jsonwebtoken')

const jwt = require('../src/lib/webToken')

const { getRandomToken } = require('../src/lib/getRandomToken')
const { validator } = require('../src/lib/validator')


const { script } = require('../scripts/script')
const { deleteRows } = require('./utils/deleteRows')
const { getRandomPort } = require('./utils/getRandomPort')
const { startApi, stopApi } = require('../api')

describe('lib -- ', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('db -- ', () => {
    beforeEach(() => {
      jest.spyOn(db, 'query').mockImplementation(() => {
        throw new Error('ERROR MYSQL')
      })
    })

    test('db query fail', async () => {
      let error

      try {
        await db.query('ABC')
      } catch (err) {
        error = err
      }

      expect(error).toMatchSnapshot()
    })

    test('failed to connect to database', async () => {
      let error

      try {
        await initializationDB('matchaTest')
      } catch (err) {
        error = err
      }

      expect(error).toMatchSnapshot()
    })

    test('faild to create table', async () => {
      let error

      try {
        await initializationTables()
      } catch (err) {
        error = err
      }

      expect(error).toMatchSnapshot()
    })
  })

  describe('jwt --', () => {
    describe('sign -- ', () => {
      test('do create token', async () => {
        jest
          .spyOn(webToken, 'sign')
          .mockReturnValue(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjpbInVzZXIiXSwidXNlcl9pZCI6IjEiLCJsb2dnZWQiOnRydWUsImlhdCI6MTU5MTU2NDQ2MSwiZXhwIjoxNTkxNTY4MDYxfQ.BZXuNFe2TxzakOGjA9To_JQcAoUb32oJkyYp9--7Zm0'
          )
        const token = await jwt.generate('1')

        expect(token).toMatchSnapshot()
      })

      test('do not create token (no id provided)', async () => {
        let error

        try {
          jwt.generate(null)
        } catch (err) {
          error = err
        }

        expect(error.message).toMatchSnapshot()
      })

      test('do not create token (token craetion failed)', async () => {
        jest.spyOn(webToken, 'sign').mockReturnValue(null)
        let error

        try {
          jwt.sign('1')
        } catch (err) {
          error = err
        }

        expect(error.message).toMatchSnapshot()
      })
    })

    describe('verify -- ', () => {
      test('do verify token', async () => {
        jest
          .spyOn(webToken, 'sign')
          .mockReturnValue(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjpbInVzZXIiXSwidXNlcl9pZCI6IjEiLCJsb2dnZWQiOnRydWUsImlhdCI6MTU5MTU2NDQ2MSwiZXhwIjoxNTkxNTY4MDYxfQ.BZXuNFe2TxzakOGjA9To_JQcAoUb32oJkyYp9--7Zm0'
          )
        const token = await jwt.generate('1')

        expect(token).toMatchSnapshot()
      })

      test('do not verify token (no token provided)', async () => {
        let error

        try {
          jwt.verify(null)
        } catch (err) {
          error = err
        }

        expect(error.message).toMatchSnapshot()
      })

      test('do not verify token (token cannot be verified)', async () => {
        jest.spyOn(webToken, 'verify').mockReturnValue(false)
        let error

        try {
          jwt.verify('abc')
        } catch (err) {
          error = err
        }

        expect(error.message).toMatchSnapshot()
      })

      test('do not verify token (token logged is false)', async () => {
        jest.spyOn(webToken, 'verify').mockReturnValue({ logged: false })
        let error

        try {
          jwt.verify('abc')
        } catch (err) {
          error = err
        }

        expect(error.message).toMatchSnapshot()
      })
    })

    describe('logout -- ', () => {
      test('do logout', async () => {
        jest
          .spyOn(webToken, 'sign')
          .mockReturnValue(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjpbXSwibG9nZ2VkIjpmYWxzZSwiaWF0IjoxNTkxNTY0NDYxfQ.GjF42FOjyyfdhCTx8C-QTawgvHow4hlvlOBW6MBml9s'
          )

        const oldToken = await jwt.generate('1')

        const token = await jwt.logout(oldToken)

        expect(token).toMatchSnapshot()
      })

      test('do not logout (failed to create token)', async () => {
        jest.spyOn(webToken, 'sign').mockReturnValue(null)
        let error

        try {
          jwt.logout('1')
        } catch (err) {
          error = err
        }

        expect(error.message).toMatchSnapshot()
      })

      test('do not logout (id is null)', async () => {
        let error

        try {
          jwt.logout(null)
        } catch (err) {
          error = err
        }

        expect(error.message).toMatchSnapshot()
      })
    })
  })

  describe('getRandomToken --', () => {
    beforeAll(async () => {
      const port = getRandomPort()

      baseUrl = `http://localhost:${port}/api`

      await script('matchaTest')

      await deleteRows()

      await startApi(port)
    })

    afterEach(async () => {
      jest.restoreAllMocks()

      await deleteRows()
    })

    afterAll(async () => {
      await stopApi()
    })

    test('do get a randomToken', async () => {
      jest
        .spyOn(crypto, 'randomBytes')
        .mockReturnValue('0000000000000000000000000000000000000001')

      const token = await getRandomToken('register_token')

      expect(token).toMatchSnapshot()
    })

    test('do get a randomToken (token already exist)', async () => {
      jest
        .spyOn(crypto, 'randomBytes')
        .mockReturnValue('0000000000000000000000000000000000000002')
        .mockReturnValueOnce('0000000000000000000000000000000000000001')

      await db.query(
        `INSERT INTO register_token (user_id, token) VALUES ("5", "0000000000000000000000000000000000000001")`
      )

      const token = await getRandomToken('register_token')

      expect(token).toMatchSnapshot()
    })
  })

  describe('validator --', () => {
    test('do not validate (arrayValidator is empty)', () => {
      let error

      try {
        validator([])
      } catch(err) {
        error = err
      }

      expect(error.message).toMatchSnapshot()
    })

    test('do not validate (element array is empty)', () => {
      let error

      try {
        validator([
          {
            element: [],
            type: 'array',
            regex: null,
            message: 'array is empty',
          },
        ])
      } catch(err) {
        error = err
      }

      

      expect(error.message).toMatchSnapshot()
    })
  })
})
