const mongoose = require('mongoose')

const logSchema = mongoose.Schema({
    description: String,
    duration: Number,
    date: { type: Date }
})

const userSchema = ({
    username: {
        type: String,
        unique: true
    },
    log: [logSchema]
})

module.exports = {
    userSchema: userSchema
}