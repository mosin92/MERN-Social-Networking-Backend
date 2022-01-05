const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = function (req, res, next) {
    //Get token from header
    const token = req.header('x-auth-token')

    //check if not token
    if (!token) return res.status(401).json({ msg: "No token,authorized denied" })

    //verify token
    try {
        const decode = jwt.verify(token, process.env.JwtSecret)
        if (decode)
            req.user = decode.users;
        next()
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" })
    }
}