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

describe(`resetPassword --`, () => {
  beforeAll(async () => {
    const port = getRandomPort()

    dotenv.config({ path: "../.env" })

    baseUrl = `http://localhost:${port}/api`

    await script("matchaTest")

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

  describe("POST /", () => {
    test("do send a resetPassword", async () => {
      jest.spyOn(transporter, "sendMail").mockReturnValue(true)
      jest
        .spyOn(crypto, "randomBytes")
        .mockReturnValue("0000000000000000000000000000000000000001")

      await db.query(
        `INSERT INTO user (nickname, firstname, lastname, email, password) 
            VALUES ("thescriv", "theo", "test", "test@test.test", "f94b937b40c946b916c63a1b638ee956")`
      )

      const { body, status } = await superagent
        .post(`${baseUrl}/resetPassword/`)
        .send({
          email: "test@test.test",
        })

      expect({ body, status }).toMatchSnapshot()

      const [[user], [resetPasswordToken]] = await Promise.all([
        db.query("SELECT * FROM user"),
        db.query("SELECT * FROM password_reset_token"),
      ])
      expect(user).toMatchSnapshot()
      expect(resetPasswordToken).toMatchSnapshot()
    })

    test("do not send a resetPassword (user does not exist)", async () => {
      let error

      try {
        await superagent.post(`${baseUrl}/resetPassword/`).send({
          email: "test@test.test",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()

      const [resetPasswordToken] = await db.query(
        "SELECT * FROM password_reset_token"
      )
      expect(resetPasswordToken).toMatchSnapshot()
    })

    test("do not send a resetPassword (sendEmail failed)", async () => {
      jest.spyOn(transporter, "sendMail").mockReturnValue(false)

      await db.query(
        `INSERT INTO user (nickname, firstname, lastname, email, password) 
            VALUES ("thescriv", "theo", "test", "test@test.test", "f94b937b40c946b916c63a1b638ee956")`
      )

      let error

      try {
        await superagent.post(`${baseUrl}/resetPassword/`).send({
          email: "test@test.test",
        })
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()

      const [resetPasswordToken] = await db.query(
        "SELECT * FROM password_reset_token"
      )
      expect(resetPasswordToken).toMatchSnapshot()
    })
  })

  describe("POST /:tokenId", () => {
    test("do reset password", async () => {
      jest.spyOn(transporter, "sendMail").mockReturnValue(true)
      jest
        .spyOn(crypto, "randomBytes")
        .mockReturnValue("0000000000000000000000000000000000000001")

      const {
        body: bodyRegisterUser,
        status: statusRegisterUser,
      } = await superagent.post(`${baseUrl}/register`).send({
        nickname: "thescriv",
        firstname: "theo",
        lastname: "test",
        email: "test@test.test",
        password: "testTest1",
      })

      expect({ bodyRegisterUser, statusRegisterUser })

      const {
        body: bodyResetPassword,
        status: statusResetPassword,
      } = await superagent.post(`${baseUrl}/resetPassword/`).send({
        email: "test@test.test",
      })

      expect({ bodyResetPassword, statusResetPassword })

      const { body, status } = await superagent
        .post(
          `${baseUrl}/resetPassword/0000000000000000000000000000000000000001`
        )
        .send({
          password: "password",
        })

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()

      const [resetPasswordToken] = await db.query(
        "SELECT * FROM password_reset_token"
      )
      expect(resetPasswordToken).toMatchSnapshot()
    })

    test("do not reset password (token does not exist)", async () => {
      await db.query(
        `INSERT INTO user (nickname, firstname, lastname, email, password) 
            VALUES ("thescriv", "theo", "test", "test@test.test", "f94b937b40c946b916c63a1b638ee956")`
      )

      let error

      try {
        await superagent
          .post(
            `${baseUrl}/resetPassword/0000000000000000000000000000000000000001`
          )
          .send({
            password: "password",
          })
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()

      const [resetPasswordToken] = await db.query(
        "SELECT * FROM password_reset_token"
      )
      expect(resetPasswordToken).toMatchSnapshot()
    })

    test("do not reset password (user does not exist)", async () => {
      await db.query(
        `INSERT INTO password_reset_token (user_id, token) VALUES ("1", "0000000000000000000000000000000000000001")`
      )
      let error

      try {
        await superagent
          .post(
            `${baseUrl}/resetPassword/0000000000000000000000000000000000000001`
          )
          .send({
            password: "password",
          })
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()

      const [resetPasswordToken] = await db.query(
        "SELECT * FROM password_reset_token"
      )
      expect(resetPasswordToken).toMatchSnapshot()
    })
  })
})
