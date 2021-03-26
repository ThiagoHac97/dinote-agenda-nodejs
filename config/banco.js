const mongoose = require("mongoose")
//conectar o banco
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/DiNote",{
}
).then(()=>{
    console.log("Banco conectado com sucesso.")
}).catch((err)=>{
    console.log("Erro ao se conectar ao banco: "+err)
})
module.exports = mongoose
