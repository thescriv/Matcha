const nodemailer = require('nodemailer')
const config = require('../../../../config')

const transporter = nodemailer.createTransport(config.TRANSPORTER_CONFIG)

module.exports = { transporter }
