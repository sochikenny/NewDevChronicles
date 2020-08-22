const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const path = require('path')

//Load Config
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

const app = express()

//logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Sessions 
app.use(session({
  secret: 'keyboard warrior',
  resave: false,
  saveUninitialized: false,
}))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))


const PORT = process.env.PORT || 3100

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/devChronics", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true 
}, () => console.log('connected to DB'));


app.listen(PORT, ()=>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})