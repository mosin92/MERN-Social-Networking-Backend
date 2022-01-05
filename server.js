const express = require('express')
const ConnectDB = require('./DbConn/dbconn')
const app = express()
require("dotenv").config()

ConnectDB(); // database will not show until you make schema
app.use(express.json())

app.get("/", (req, res) => res.json("Server is Running!"));

// defines Routes 
app.use("/users", require("./api/user"))
app.use("/profile", require("./api/profile"))
app.use("/auth", require("./api/auth"))
app.use("/post", require("./api/post"))


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server Started on port:", { PORT })
})