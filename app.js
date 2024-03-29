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
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)

//Configurações
//sessao
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//Midleware
app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
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
    next()
})

//
//sempre chamar as rotas abaixo das configurações
//Rotas
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {

        res.render("index", { postagens: postagens })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})

app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
            if (postagem) {
                res.render("postagem/index", { postagem: postagem })
            } else {
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })
    //lista categorias
app.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("categorias/index", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao lista as categorias")
        res.redirect("/")
    })
})

//rota que lista categoria por tipo
app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {

            Postagem.find({ categoria: categoria._id }).then((postagem => {
                res.render("categorias/postagens", { postagens: postagem, categoria: categoria })
            })).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts")
                res.redirect("/")
            })

        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a pagina desta categoria")
        res.redirect("/")
    })
})



app.get("/404", (res, req) => {
    res.send("Erro 404")
})

app.get('/posts', (req, res) => {
    res.send("Lista Posts")
})

app.use('/admin', admin)

app.use("/usuarios", usuarios)



//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor Rodando")
})