const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const path = require('path')
const methodOverride = require('method-override')

//Load Config
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

const app = express()

//Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method Override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

//logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

//Handlebars
app.engine("handlebars", exphbs({ helpers: { formatDate, stripTags, truncate, editIcon, select }, defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Sessions 
app.use(session({
  secret: 'keyboard warrior',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection})
}))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Set Global Var
app.use(function (req, res, next){
  res.locals.user = req.user || null
  next()
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/chronicles', require('./routes/chronicles'))


const PORT = process.env.PORT || 3100

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/devChronics", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true 
}, () => console.log('connected to DB'));


app.listen(PORT, ()=>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})