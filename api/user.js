const express = require("express")
const UserRouter = express.Router()
const { check, validationResult } = require("express-validator")
const User = require("../model/user-model")
const gravator = require("gravatar")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

//Register user Steps

// 1. check user already exist or not
// 2.has user password
// Get user pic from gravator
// at last save object in mongo

UserRouter.post("/", [
    check("name", "name is Required").not().isEmpty(),
    check('email', "Please a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.staus(400).json({ errors: errors.array() })
    const { name, email, password } = req.body;
    let users = await User.findOne({ email })
    if (users)
        return res.status(400).json({ errors: [{ msg: 'User Already Exist!' }] })

    // addding gravator
    try {
        const avatar = gravator.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        users = new User({
            name,
            email,
            password,
            avatar
        })
        // Bcrypting Password ...
        users.password = await bcryptjs.hash(password, 10)
        await users.save()

        const payload = {
            users:{
                id:users.id
            }
        }
        jwt.sign(payload, process.env.JwtSecret, ({ expiresIn: 360000 }, (err, token) => {
            if (err) throw err
            res.json({ token })

        }))
    } catch (err) {
        console.error("Error ", err)
    }

})

module.exports = UserRouter;