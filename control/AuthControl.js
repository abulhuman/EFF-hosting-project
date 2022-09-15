const Users = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SALT_ROUNDS = process.env.SALT_ROUND || 10
const wrapAsync = require('../utils/wrapAsync')

const jsonWebTokenPrivateKey =
  process.env.JWT_PRIVATE_KEY || '6bjhds67dbfd9r36teofbe9364583beu'

module.exports.Login = wrapAsync(async function (req, res) {
  const allusers = await Users.find()
  if (allusers.length) {
    const data = req.body
    if (!(data.username && data.password)) {
      const msg = {
        msg: 'The requested function cannot be done',
        status: 401
      }
      return res.json(msg)
    }

    const userdata = await Users.findOne({ username: data.username })
    const decryptedPasswordResult = await bcrypt.compare(
      data.password,
      userdata.password
    )
    if (decryptedPasswordResult) {
      const token = jwt.sign(
        { login_token: userdata._id },
        jsonWebTokenPrivateKey
      )
      req.session.token = token
      return res.json({
        token: token,
        msg: 'Login Successful',
        userdata: allusers,
        status: 200
      })
    } else {
      return res.json({
        msg: 'incorrect email or password',
        status: 401
      })
    }
  } else {
    return res.json({
      msg: 'No user Available! You have to add user first',
      status: 200
    })
  }
})

module.exports.Logout = wrapAsync(function (req, res) {
  req.session.token = null
  return res.json({
    msg: 'Logged out successfully',
    status: 200
  })
})
