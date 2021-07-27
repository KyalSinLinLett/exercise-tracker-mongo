const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { User } = require('./models')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// connect to mongodb
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('*', (req, res) => {
  res.send('Not found')
}).post('*', (req, res) => {
  res.send('Not found')
})

app.post('/api/users', (req, res) => {
  const user = new User({ username: req.body.username })

  user.save((err, user) => {
    if (err) {
      const {err: code} = {err: err.code}
      if (code === 11000) return res.send('Username already taken')
      return res.send(err)
    } 

    return res.json({ _id: user._id, username: user.username })
  })
})

app.get('/api/users', (req, res) => {
  User.find({}, { log: 0 }, (err, users) => {
    if (err) return res.send(err)

    return res.json(users)
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {

  var { description: desc, ':_id': userId, duration: dura, date: date } = req.body

  if (date === '') {
    date = new Date().toDateString()
  }

  date = new Date(date).toDateString()

  if(date == 'Invalid Date') {
    return res.send(`Cast to date failed`)
  }

  const payload = {
    date: date,
    duration: parseInt(dura),
    description: desc
  }

  User.findByIdAndUpdate(
    userId, 
    { $push : { log: payload } }, 
    { new: true },
    (err, data) => {
      if (err) return console.log(err)

      if (data == null) return res.send("Unknown userId")

      return res.json(Object.assign({ _id: data._id, username: data.username }, payload))
    } 
  )
})

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id

  User.findById(userId, (err, data) => {
    if (err) return console.log(err)

    var logs = data.log.map((log) => ({ description: log.description, duration: log.duration, date: log.date }))

    return res.json(Object.assign({_id: data._id, username: data.username, count: logs.length, log: logs}))
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
