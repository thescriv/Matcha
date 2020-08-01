const { routerLogin } = require('./src/login')
const { routerRegister } = require('./src/register')
const { routerProfile } = require('./src/profile')
const { routerResetPassword } = require('./src/resetPassword')

module.exports = [
  {
    path: 'login',
    router: routerLogin,
  },
  {
    path: 'register',
    router: routerRegister,
  },
  {
    path: 'profile',
    router: routerProfile,
  },
  {
    path: 'resetPassword',
    router: routerResetPassword
  }
]
