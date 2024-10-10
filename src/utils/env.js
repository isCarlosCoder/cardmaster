const { z } = require('zod')

const envSchema = z.object({
  NODEMAILER_HOST: z.string().default('smtp.ethereum.email'),
  NODEMAILER_PORT: z.string().default('587').transform(Number),
  NODEMAILER_SECURE: z.string().default('false').transform(v => v === 'true'),
  NODEMAILER_USER: z.string().default('your-email'),
  NODEMAILER_PASS: z.string().default('your-password'),
  RECAPTCHA_SITE_KEY: z.string().default('your-site-key'),
  RECAPTCHA_SECRET_KEY: z.string().default('your-secret-key'),
})

const env = envSchema.parse(process.env)

module.exports = {
  env
}