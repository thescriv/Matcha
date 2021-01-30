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

describe(`auth -- `, () => {
  beforeAll(async () => {
    const port = getRandomPort()

    baseUrl = `http://localhost:${port}/api`

    await script("matchaTest")

    await startApi(port)
  })

  beforeEach(async () => {
    const [insertedUser] = await db.query(
      `INSERT INTO user (nickname, firstname, lastname, email, password, bio, gender_id) 
              VALUES ("thescriv", "theo", "test", "test@test.test", "abc", "", 1)`
    )

    userId = insertedUser.insertId

    token = jwt.generate(userId)
  })

  afterEach(async () => {
    await deleteRows()

    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await stopApi()
  })

  test.only("do not auth (token cannot be verified)", async () => {
    console.log("hello")

    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("api.generateWT token cannot_be_verified")
    })

    const token = jwt.generate("1")

    let error

    try {
      await superagent
        .get(`${baseUrl}/profile/`)
        .set("Authorization", `Bearer ${token}`)
    } catch (err) {
      error = err
    }

    console.log("hello")

    const { body, status } = error.response

    expect({ body, status }).toMatchSnapshot()
  })

  test("do not auth (no token)", async () => {
    try {
      await superagent.get(`${baseUrl}/profile/`)
    } catch (err) {
      error = err
    }
    const { body, status } = error.response

    expect({ body, status }).toMatchSnapshot()
  })

  test("do not auth (user is not logged)", async () => {
    const token = webToken.sign(
      { auth: ["user"], user_id: "1", logged: false },
      config.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    )

    let error

    try {
      await superagent
        .get(`${baseUrl}/profile/`)
        .set("Authorization", `Bearer ${token}`)
    } catch (err) {
      error = err
    }

    const { body, status } = error.response

    expect({ body, status }).toMatchSnapshot()
  })

  test("do not auth (no user_id in token)", async () => {
    const token = webToken.sign(
      { auth: ["user"], logged: true },
      config.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    )

    let error

    try {
      await superagent
        .get(`${baseUrl}/profile/`)
        .set("Authorization", `Bearer ${token}`)
    } catch (err) {
      error = err
    }

    const { body, status } = error.response

    expect({ body, status }).toMatchSnapshot()
  })

  test("do not auth (no logged in token)", async () => {
    const token = webToken.sign(
      { auth: ["user"], user_id: "1" },
      config.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    )

    let error

    try {
      await superagent
        .get(`${baseUrl}/profile/`)
        .set("Authorization", `Bearer ${token}`)
    } catch (err) {
      error = err
    }

    const { body, status } = error.response

    expect({ body, status }).toMatchSnapshot()
  })
})
