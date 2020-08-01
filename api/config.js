module.exports = {
  DB_CONFIG: {
    host: process.env.DB_HOST  || 'localhost',
    user: process.env.DB_USER || 'root' ,
    password: process.env.DB_PASSWORD || 'password',
    connectionLimit: process.env.DB_CONNECTION_LIMIT || '100',
    port: process.env.DB_PORT || '3306',
  },
  TRANSPORTER_CONFIG: {
    host: process.env.TRANSPORTER_HOST || 'transporter-host',
    port: process.env.TRANSPORTER_PORT || 'transporter-port',
    secure: process.env.TRANSPORTER_SECURE || 'transporter-secure',
    auth: {
      user: process.env.TRANSPORTER_USER  || 'transporter-auth-user',
      pass: process.env.TRANSPORTER_PASSWORD || 'transporter-auth-password',
    },
  },
  PORT: process.env.PORT || '3001',
  DB_NAME: process.env.DB_NAME || 'matchaTest',
  SECRET_KEY: process.env.SECRET_KEY || 'matchaTest',
  API_URL: process.env.API_URL || 'http://localhost/api',
  EMAIL_MATCHA: process.env.EMAIL_MATCHA || 'email-matcha',
}
