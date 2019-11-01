//Carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")

//Configurações
//sessao
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

//Midleware
app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    //Body PArser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
    //Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars');
//Monogoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogapp').then(() => {
    console.log("Conectado ao mongo!")
}).catch((erro) => {
    console.log("Erro" + erro)
})

//Public
app.use(express.static(path.join(__dirname, "public")))


app.use((req, res, next) => {
    console.log("Oi eu sou um midleware")
    next()
})

//
//sempre chamar as rotas abaixo das configurações
//Rotas
app.use('/admin', admin)

//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor Rodando")
})