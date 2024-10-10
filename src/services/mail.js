const mailer = require('nodemailer');
const { env } = require('../utils/env')

const transporter = mailer.createTransport({
  host: env.NODEMAILER_HOST,
  port: env.NODEMAILER_PORT,
  secure: env.NODEMAILER_SECURE,
  auth: {
    user: env.NODEMAILER_USER,
    pass: env.NODEMAILER_PASS
  }
})

async function sendMail(mailOptions) {
  return new Promise(async (resolve, reject) => {
    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}

module.exports = {
  sendMail
}