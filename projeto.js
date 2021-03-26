//Carregando módulos
    require('./config/dados')
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require("body-parser")
    const mongoose = require('./config/banco')
    const app = express()
    const moment = require('moment')
    const tarefa = mongoose.model("Tarefas")
    const usuario = mongoose.model("Usuarios")
    const session = require("express-session")
    const flash = require("connect-flash")
    const passport = require('passport')
    require("./config/auth")(passport)
    const {loginCheck} = require("./helpers/loginCheck")
    const MPlayer = require('mplayer');
    const { concat } = require('lodash')
    var player = require('play-sound')(opts = {})

    //alarme
    setInterval(function(){
        tarefa.find({},{periodo_ini:1, _id:0}).lean().then((Tarefas)=>{
            var d = new Date();
            var h = moment(d).format('hh:mm')
            Tarefas.forEach(hora=>{
                if(h == hora.periodo_ini){
                    console.log("check")
                    player.play('clock.mp3', function(err){
                        if (err) throw err
                     })
                }
            })
        })
    },10*1000)

    //sessão
    app.use(session({
        secret:"dinoco95",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
//middleware
    app.use((req, res, next)=>{
        res.locals.sucesso_msg = req.flash("sucesso_msg")
        res.locals.falha_msg = req.flash("falha_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })

//body
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//handle
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine','handlebars');
app.use(express.static('views/public'));

//Rotas get
app.get('/novatarefa', function(req, res){
    res.render('agenda')
})
app.get('/', loginCheck, (req,res) =>{
    tarefa.find({tarefaId:req.user._id}).lean().then((Tarefas)=> {
        res.render('inicial', {Tarefas: Tarefas, user: req.user.user})
    }).catch((erro) =>{
        console.log("Não foi possível listar as tarefas." +erro)
    })
})

app.get('/cadastrar', (req,res) => {
    res.render('cadastro')
})
app.get('/entrar', (req,res) => {
    res.render('login')
})
app.get('/edit/:id', loginCheck, (req,res) => {
    tarefa.findOne({_id:req.params.id}).lean().then((nota) => {
        //Function Repetir
        var Nunca, Mes, Semana, Semana2;
        var repetir= [Nunca, Mes, Semana, Semana2];
        if(nota.repetir == "nunca"){
            repetir.Nunca = "selected"
        }else if(nota.repetir == "mes"){
            repetir.Mes = "selected"
        }else if(nota.repetir == "semana"){
            repetir.Semana = "selected"
        }else if(nota.repetir == "2semana"){
            repetir.Semana2 = "selected"
        }
        //Function Tipo
        var Pes, Acad, Trab, Facul;
        var calend= [Pes, Acad, Trab, Facul];
        if(nota.tipo_cal == "Pessoal"){
            calend.Pes = "selected"
        }else if(nota.tipo_cal == "Academia"){
            calend.Acad = "selected"
        }else if(nota.tipo_cal == "Trabalho"){
            calend.Trab = "selected"
        }else if(nota.tipo_cal == "Faculdade"){
            calend.Facul = "selected"
        }
        //Function Lembrete
        var Hora, Min5, Min10, Min30, Antes1h;
        var lemb= [Hora, Min5, Min10, Antes1h];
        if(nota.lembrete == "hora"){
            lemb.Hora = "selected"
        }else if(nota.lembrete == "5min"){
            lemb.Min5 = "selected"
        }else if(nota.lembrete == "10min"){
            lemb.Min10 = "selected"
        }else if(nota.lembrete == "30min"){
            lemb.Min30 = "selected"
        }else if(nota.lembrete == "1hr"){
            lemb.Antes1h = "selected"
        }
        res.render('edit', {nota: nota, repetir: repetir, calend: calend,lemb: lemb})
    }).catch((erro) => {
        req.flash("falha_msg", "Essa nota não existe")
        res.redirect("/")
    })
})
app.get('/sair' ,function(req,res){
    req.logOut()
    req.session.destroy((err)=>{
        res.clearCookie()
        res.redirect("/entrar")
    })
})
app.get('/calendario', function(req,res){
    tarefa.find({tarefaId:req.user._id}).lean().then((Tarefas)=> {
        res.render('calendario', {Tarefas: Tarefas})
    }).catch((erro) =>{
        console.log("Não foi possível exibir a tarefa." +erro)
    })
})

//Rotas post
app.post("/signin", (req, res, next) => {

    passport.authenticate("local",{
        successRedirect: "/",
        failureRedirect:"/entrar",
        failureFlash: true
    })(req, res, next)
})
app.post('/signup', (req, res) => {
    var erros = []
    if(! req.body.username || typeof req.body.username == undefined || req.body.username == null){
        erros.push({text: "Por favor, preencha o campo de usuário."})
    }
    if(! req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({text: "Por favor, preencha o campo de email."})
    }
    if(! req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({text: "Por favor, preencha o campo de senha."})
    }
    if(! req.body.csenha || typeof req.body.csenha == undefined || req.body.csenha == null){
        erros.push({text: "Por favor, preencha o campo de confirmar a senha."})
    }
    if(req.body.senha != req.body.csenha){
        erros.push({text:"Por favor, verifique novamente se as senhas são iguais."})
    }
    if(erros.length>0){
        res.render("cadastro",{erros: erros})
    }
    else{
        const novoUsuario = {
            user: req.body.username,
            password:req.body.senha,
            email: req.body.email
        }
        new usuario(novoUsuario).save().then(function(){
            req.flash("sucesso_msg", "Usuário cadastro com sucesso.")
            res.redirect('/')
        }).catch(function(erro){
            res.flash("falha_msg", "Houve um erro ao cadastro usuário.")
            res.redirect("/cadastro")
        })
    }
})
app.post('/newnote', (req, res) => {
    var erros = []
    if(! req.body.author  || typeof req.body.author == undefined ||req.body.author == null){
        erros.push({text: "Por favor, informe o titulo da nota."})
    }
    if(! req.body.message  || typeof req.body.message == undefined ||req.body.message == null){
        erros.push({text: "Por favor, informe a descrição da nota."})
    }
    if(erros.length>0){
        res.render("agenda",{erros: erros})
    }
    else{
        const novaTarefa = {
            titulo: req.body.author,
            descricao: req.body.message,
            data: req.body.date,
            periodo_ini: req.body.time,
            periodo_fim: req.body.timef,
            repetir: req.body.tempo,
            tipo_cal: req.body.dia,
            lembrete: req.body.lbt,
            tarefaId: req.user._id
        }
        new tarefa(novaTarefa).save().then(function(){
            req.flash("sucesso_msg", "Nota criada com sucesso.")
            res.redirect('/')
        }).catch(function(erro){
            res.flash("falha_msg", "Houve um erro na criação da tarefa.")
            res.redirect("/novatarefa")
        })
    }
})
app.post('/editNote', (req,res) =>{
        tarefa.findOne({_id: req.body.id}).then((nota) => {
            nota.titulo = req.body.author
            nota.descricao = req.body.message
            nota.data = req.body.date
            nota.periodo_ini = req.body.time
            nota.periodo_fim = req.body.timef
            nota.repetir = req.body.tempo
            nota.tipo_cal = req.body.dia
            nota.lembrete = req.body.lbt

            nota.save().then(() => {
                req.flash("sucesso_msg", "Nota Editada com Sucesso.")
                res.redirect("/")
            }).catch((erro) =>{
                req.flash("falha_msg", "Não foi possível editar essa nota.")
                res.redirect("/")
            })
        }).catch((erro) => {
            req.flash("falha_msg", "Houve um erro na edição")
            res.redirect('/')
        })
})
app.post('/delete', (req,res) =>{
    tarefa.remove({_id: req.body.id}).then(() =>{
        req.flash("sucesso_msg", "Nota deletada com Sucesso.")
        res.redirect("/")
    }).catch((erro) =>{
        req.flash("falha_msg", "Ocorreu um erro ao deletar categoria")
        res.redirect("/")
    })
})

//Port
app.listen(3000,()=>{
    console.log("Servidor ouvindo a porta 3000")
})