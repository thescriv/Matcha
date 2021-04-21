async function errorHandling(_req, _res, next) {
  try {
    await next()
    console.log('no error handled')
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  errorHandling,
}
