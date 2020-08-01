function getRandomPort () {
    return Math.round(Math.random() * (65536 - 1024) + 124)
  }

  module.exports = { getRandomPort }