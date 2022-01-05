const express = require("express")
const UserRouter = express.Router()
const auth = require("../middleware/auth")
const User = require("../model/user-model")
const { check, validationResult } = require("express-validator")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")


UserRouter.get("/", auth, async (req, res) => {
    try {
        console.log("req user", req.user)
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(400).json("Server Error")
    }
})

UserRouter.post("/", [
    check('email', "Please a valid email").isEmail(),
    check("password", "Passwor is Required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.staus(400).json({ errors: errors.array() })

    const { email, password } = req.body;
    // addding gravator
    try {
        let users = await User.findOne({ email })
        if (!users)
            return res.status(400).json({ errors: [{ msg: 'Invalid Crediential!' }] })

        const isMatch = await bcryptjs.compare(password, users.password)
        if (!isMatch) return res.status(400).json({ errors: [{ msg: 'Invalid Crediential!' }] })

        const payload = {
            users: {
                id: users.id
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