const express = require('express')
const { check, validationResult } = require('express-validator')
const User = require('../../models/userSchema')
const generateToken = require('../../helper/helper')

const router = express.Router()

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
      let user = await User.findOne({ email })
      if (user)
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] })

      user = new User({ name, email, password })
      await user.save()

      const token = generateToken(user._id)

      res.status(201).json({ token })
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error', err)
    }
  }
)

module.exports = router
