module.exports = {
    loginCheck: function(req,res,next){
        if(req.isAuthenticated()){
            return next()
        }
        req.flash("falha_msg", "Você deve estar logado para continuar.")
        res.redirect("/entrar")
    }
}