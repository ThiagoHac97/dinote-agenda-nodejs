const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
require("./dados")
const Usuario = mongoose.model("Usuarios")

module.exports = function(passport){

    passport.use(new localStrategy({usernameField:'username', passwordField: 'senha'},(username, senha, done)=>{

        Usuario.findOne({user: username}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: "Esse usuário não existe no sistema."})
            }
            if(senha==usuario.password){
                return done(null, usuario)
            }
            else{
                return done(null, false, {message: "A senha digitada está incorreta."})
            }
        })
    }))

    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done)=>{
        Usuario.findById(id,(err, usuario)=>{
            done(err, usuario)
        })
    })
}