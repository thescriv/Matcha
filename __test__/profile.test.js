const superagent = require("superagent")
const webToken = require("jsonwebtoken")
const crypto = require("crypto")

const db = require("../src/lib/db")
const jwt = require("../src/lib/webToken")
const config = require("../config")

const { script } = require("../scripts/script")
const { deleteRows } = require("./utils/deleteRows")
const { getRandomPort } = require("./utils/getRandomPort")
const { startApi, stopApi } = require("../api")

let baseUrl
let token
let userId

describe(`profile -- `, () => {
  beforeAll(async () => {
    const port = getRandomPort()

    console.log(port)

    baseUrl = `http://localhost:${port}/api`

    await startApi(port)
  })

  beforeEach(async () => {
    console.log("hello")

    await deleteRows()

    const insertId = await db.query(
      `INSERT INTO user (nickname, firstname, lastname, email, password, bio, gender_id) 
              VALUES ("thescriv", "theo", "test", "test@test.test", "abc", "", 1)`
    )

    userId = insertId[0].insertId

    token = jwt.generate(userId)
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await stopApi()
  })

  describe("GET /profile/me", () => {
    test("do get me", async () => {
      const { body, status } = await superagent
        .get(`${baseUrl}/profile/me`)
        .set("Authorization", `Bearer ${token}`)

      expect({ body, status }).toMatchSnapshot()
    })

    test("do not get me (user does not exist)", async () => {
      const tokenWithUnknownUser = jwt.generate("0")

      let error

      try {
        await superagent
          .get(`${baseUrl}/profile/me`)
          .set("Authorization", `Bearer ${tokenWithUnknownUser}`)
      } catch (err) {
        error = err
      }

      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })
  })

  describe("GET /profile/logout", () => {
    test("do logout", async () => {
      const { body, status } = await superagent
        .get(`${baseUrl}/profile/logout`)
        .set("Authorization", `Bearer ${token}`)

      expect({ body, status }).toMatchSnapshot()
    })

    test("do not logout (jwt.logout throw)", async () => {
      jest.spyOn(jwt, "logout").mockImplementation(() => {
        throw new Error("api.generateWT token cannot_be_generated")
      })

      try {
        await superagent
          .get(`${baseUrl}/profile/logout`)
          .set("Authorization", `Bearer ${token}`)
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })
  })

  describe("POST /profile/update", () => {
    test("do update profile", async () => {
      const { body, status } = await superagent
        .post(`${baseUrl}/profile/update`)
        .set("Authorization", `Bearer ${token}`)
        .send({ firstname: "Jack" })

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do update profile (password modified)", async () => {
      jest
        .spyOn(crypto, "randomBytes")
        .mockReturnValue("0000000000000000000000000000000000000001")

      const { body, status } = await superagent
        .post(`${baseUrl}/profile/update`)
        .set("Authorization", `Bearer ${token}`)
        .send({ firstname: "Jack", password: "Thescriv1" })

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })

    test("do not update profile (body is not valid)", async () => {
      let error

      try {
        await superagent
          .post(`${baseUrl}/profile/update`)
          .set("Authorization", `Bearer ${token}`)
          .send({ password: "Ai" })
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user] = await db.query("SELECT * FROM user")
      expect(user).toMatchSnapshot()
    })
  })

  describe.only(":visit_id", () => {
    let visitId

    beforeEach(async () => {
      const { insertId } = await db.query(
        `INSERT INTO user (nickname, firstname, lastname, email, password) 
              VALUES ("gdelabro", "guilhem", "test", "glb@test.test", "abc")`
      )

      visitId = insertId
    })

    test("do not visit (user does not exist)", async () => {
      let error

      try {
        await superagent
          .post(`${baseUrl}/profile/99`)
          .set("Authorization", `Bearer ${token}`)
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test("do not visit (user try to visit himself)", async () => {
      let error

      try {
        await superagent
          .post(`${baseUrl}/profile/${userId}`)
          .set("Authorization", `Bearer ${token}`)
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()
    })

    test("do not visit (user has been blocked)", async () => {
      await db.query(
        "INSERT INTO user_blocked (user_id_1, user_id_2) VALUES(?, ?)",
        [visitId, userId]
      )

      let error
      try {
        await superagent
          .post(`${baseUrl}/profile/${visitId}/block`)
          .set("Authorization", `Bearer ${token}`)
      } catch (err) {
        error = err
      }
      const { body, status } = error.response

      expect({ body, status }).toMatchSnapshot()

      const [user_blocked] = await db.query("SELECT * FROM user_blocked")

      expect(user_blocked).toMatchSnapshot()
    })

    describe("POST /profile/:visit_id", () => {
      test("do visit", async () => {
        const { body, status } = await superagent
          .post(`${baseUrl}/profile/${visitId}`)
          .set("Authorization", `Bearer ${token}`)

        expect({ body, status }).toMatchSnapshot()
      })
    })

    describe("POST /profile/:visit_id/like", () => {
      test("do like", async () => {
        const { body, status } = await superagent
          .post(`${baseUrl}/profile/${visitId}/like`)
          .set("Authorization", `Bearer ${token}`)

        expect({ body, status }).toMatchSnapshot()

        const [user_like] = await db.query("SELECT * FROM user_like")

        expect(user_like).toMatchSnapshot()
      })

      test("do not like (already liked)", async () => {
        await db.query(
          "INSERT INTO user_like (user_id_1, user_id_2) VALUES(?, ?)",
          [userId, visitId]
        )

        let error

        try {
          await superagent
            .post(`${baseUrl}/profile/${visitId}/like`)
            .set("Authorization", `Bearer ${token}`)
        } catch (err) {
          error = err
        }
        const { body, status } = error.response

        expect({ body, status }).toMatchSnapshot()
      })

      test("do match", async () => {
        await db.query(
          "INSERT INTO user_like (user_id_1, user_id_2) VALUES(?, ?)",
          [visitId, userId]
        )

        const { body, status } = await superagent
          .post(`${baseUrl}/profile/${visitId}/like`)
          .set("Authorization", `Bearer ${token}`)

        expect({ body, status }).toMatchSnapshot()

        const [user_like] = await db.query("SELECT * FROM user_like")

        expect(user_like).toMatchSnapshot()

        const [user_match] = await db.query("SELECT * FROM user_match")

        expect(user_match).toMatchSnapshot()
      })

      test("do not match (already liked)", async () => {
        await db.query(
          "INSERT INTO user_match (user_id_1, user_id_2) VALUES(?, ?)",
          [userId, visitId]
        )

        let error

        try {
          await superagent
            .post(`${baseUrl}/profile/${visitId}/like`)
            .set("Authorization", `Bearer ${token}`)
        } catch (err) {
          error = err
        }
        const { body, status } = error.response

        expect({ body, status }).toMatchSnapshot()
      })
    })

    describe("POST /profile/:visit_id/block", () => {
      test("do block", async () => {
        const { body, status } = await superagent
          .post(`${baseUrl}/profile/${visitId}/block`)
          .set("Authorization", `Bearer ${token}`)

        expect({ body, status }).toMatchSnapshot()

        const [user_blocked] = await db.query("SELECT * FROM user_blocked")

        expect(user_blocked).toMatchSnapshot()
      })

      test("do unblock", async () => {
        await db.query(
          "INSERT INTO user_blocked (user_id_1, user_id_2) VALUES(?, ?)",
          [userId, visitId]
        )

        const { body, status } = await superagent
          .post(`${baseUrl}/profile/${visitId}/block`)
          .set("Authorization", `Bearer ${token}`)

        expect({ body, status }).toMatchSnapshot()

        const [user_blocked] = await db.query("SELECT * FROM user_blocked")

        expect(user_blocked).toMatchSnapshot()
      })
    })

    describe("POST /profile/:visit_id/flag", () => {
      test("do flag", async () => {
        const { body, status } = await superagent
          .post(`${baseUrl}/profile/${visitId}/flag`)
          .set("Authorization", `Bearer ${token}`)

        expect({ body, status }).toMatchSnapshot()

        const [user_flaged] = await db.query("SELECT * FROM user_flaged")

        expect(user_flaged).toMatchSnapshot()
      })

      test("do flag (user already flagged)", async () => {
        await db.query(
          `INSERT INTO user_flaged (user_id, flag_count) VALUES (?, ?)`,
          [visitId, 1]
        )
        const { body, status } = await superagent
          .post(`${baseUrl}/profile/${visitId}/flag`)
          .set("Authorization", `Bearer ${token}`)

        expect({ body, status }).toMatchSnapshot()

        const [user_flaged] = await db.query("SELECT * FROM user_flaged")

        expect(user_flaged).toMatchSnapshot()
      })
    })
  })
})
