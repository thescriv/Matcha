const express = require("express")

const jwt = require("../lib/webToken")

const {
  getProfile,
  updateProfile,
  likeProfile,
  visitProfile,
  blockProfile,
  flagProfile,
  getVisitedUser,
  getLikedUser,
} = require("./controller")

const routerProfile = express.Router()

routerProfile.get("/me", getProfile)

routerProfile.post("/update", updateProfile)

routerProfile.get("/logout", async (req, res) => {
  const { userId } = req.auth
  try {
    const token = await jwt.logout(userId)

    res.header("Authorization", `Bearer ${token}`)

    res.sendStatus(204)
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
})

routerProfile.get("/visited_user", getVisitedUser)

routerProfile.get("/liked_user", getLikedUser)

routerProfile.post("/:visit_id", visitProfile)
routerProfile.post("/:visit_id/like", likeProfile)
routerProfile.post("/:visit_id/block", blockProfile)
routerProfile.post("/:visit_id/flag", flagProfile)

module.exports = { routerProfile }
