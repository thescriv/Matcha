const crypto = require("crypto")
const superagent = require("superagent")
const dotenv = require("dotenv")

const db = require("../src/lib/db")

const { script } = require("../scripts/script")
const { deleteRows } = require("./utils/deleteRows")
const { transporter } = require("../src/lib/transporter")
const { getRandomPort } = require("./utils/getRandomPort")
const { startApi, stopApi } = require("../api")

let baseUrl

describe(`register --`, () => {
  beforeAll(async () => {
    const port = getRandomPort()

    dotenv.config({ path: "../.env" })

    baseUrl = `http://localhost:${port}/api`

    await script("matchaTest")

    await deleteRows()

    await startApi(port)
  })

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(1000000000000)
  })

  afterEach(async () => {
    jest.restoreAllMocks()

    await deleteRows()
  })

  afterAll(async () => {
    await stopApi()
  })

  describe("POST /register", () => {
    test("do register", async () => {
      jest.spyOn(transporter, "sendMail").mockReturnValue(true)
      jest
        .spyOn(crypto, "randomBytes")
        .mockReturnValue("0000000000000000000000000000000000000001")

      const { body, status } = await superagent
        .post(`${baseUrl}/register`)
        .send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: "testTest1",
        })

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()

      const [tokenLink] = await db.query("SELECT * FROM register_token")
      expect(tokenLink).toMatchSnapshot()
    })

    test("do not register (query fail on insert but errno != 1062)", async () => {
      jest.spyOn(db, "query").mockImplementation(() => {
        throw new Error("AN ERROR OCCURED")
      })

      let error
      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: "testTest1",
        })
      } catch (err) {
        error = err.response
      }
      const { body, status } = error

      expect({ body, status }).toMatchSnapshot()
    })

    test("do not register (sendMail failed)", async () => {
      jest.spyOn(transporter, "sendMail").mockReturnValue(false)

      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (email already exist)", async () => {
      await db.query(
        `INSERT INTO user (nickname, firstname, lastname, email, password) 
        VALUES ("thescriv", "theo", "test", "test@test.test", "f94b937b40c946b916c63a1b638ee956")`
      )

      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv1",
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (nickname already exist)", async () => {
      await db.query(
        `INSERT INTO user (nickname, firstname, lastname, email, password) 
        VALUES ("thescriv", "theo", "test", "test@test1.test", "f94b937b40c946b916c63a1b638ee956")`
      )

      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (bad email)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: "test@test",
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (bad password)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: "test",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (no firstname)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: null,
          lastname: "test",
          email: "test@test.test",
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (no lastname)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: null,
          email: "test@test.test",
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (no nickname)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: null,
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (no email)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: null,
          password: "testTest1",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not register (no password)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/register`).send({
          nickname: "thescriv",
          firstname: "theo",
          lastname: "test",
          email: "test@test.test",
          password: null,
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })
  })

  describe("GET /register/verify-email/:id", () => {
    test("do verifyEmail", async () => {
      jest.spyOn(transporter, "sendMail").mockReturnValue(true)
      jest
        .spyOn(crypto, "randomBytes")
        .mockReturnValue("0000000000000000000000000000000000000001")

      const [{ insertId }] = await db.query(
        `INSERT INTO user (firstname, lastname, email, password) 
          VALUES ("theo", "test", "test@test.test", "f94b937b40c946b916c63a1b638ee956")`
      )

      await db.query(`INSERT INTO register_token (token, user_id) 
        VALUES ("0000000000000000000000000000000000000001", "${insertId}")`)

      const { body, status } = await superagent.get(
        `${baseUrl}/register/verify-email/0000000000000000000000000000000000000001`
      )

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()

      const [tokenLink] = await db.query("SELECT * FROM register_token")
      expect(tokenLink).toMatchSnapshot()
    })

    test("do not verifyEmail (id is null)", async () => {
      let error

      try {
        await superagent.get(`${baseUrl}/register/verify-email/null`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test("do not verifyEmail (no id)", async () => {
      let error

      try {
        await superagent.get(`${baseUrl}/register/verify-email/`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test("do not verifyEmail (id does not exist)", async () => {
      let error

      try {
        await superagent.get(
          `${baseUrl}/register/verify-email/0000000000000000000000000000000000000001`
        )
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })
  })
})
