const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')
const connectDb = require('./functions/connectDb')
const enforce = require('express-sslify')

const szavazokorok = require('./routes/szavazokorok')
const kozigEgyseg = require('./routes/kozigegysegek')
const vhupage = require('./routes/vhupage')
const usage = require('./routes/usage')
const valasztokerulet = require('./routes/valasztokeruletek')
const szavazatok = require('./routes/szavazatok')
const valasztasok = require('./routes/valasztasok')


dotenv.config()
const app =  express()

connectDb()

const corsOptions = {
  origin: '*',
  credentials: false,
  exposedHeaders: [ 'X-Total-Count', 'X-Prev-Page', 'X-Next-Page' ]
};

// Middlewares
if (app.get("env") === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }))
}
app.use(bodyParser.json({limit: '50mb'}))
app.use(cors(corsOptions))

app.use('/', express.static(path.join(__dirname, 'apidoc')))
app.use('/kozigegysegek', kozigEgyseg)
app.use('/szavazokorok', szavazokorok)
app.use('/valasztokeruletek', valasztokerulet)
app.use('/usage', usage)
app.use('/vhupage', vhupage)
app.use('/szavazatok', szavazatok)
app.use('/valasztasok', valasztasok)

// Listen
var port = process.env.PORT || 1338
app.listen(port, () => {
  console.log(`listening on ${port}`)
})
