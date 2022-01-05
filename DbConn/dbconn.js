const mongoose = require('mongoose');

const ConnectDB =  () => {
    try {
        mongoose.connect("mongodb://localhost:27017/SocialNetwork", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log("Database connection sucessfully ")
        }).catch((err) => {
            console.log("Error in connection", err)
        })
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

module.exports = ConnectDB;