const banco = require('./banco')
//estrutura dos dados no banco
const UsuariosSchema = banco.Schema({
    user:{
        type: String
    },
    password:{
        type: String
    },
    email:{
        type: String
    }
})
const TarefasSchema = banco.Schema({
    titulo: {
        type: String
    },
    descricao: {
        type: String

    },
    data:{
        type: String

    },
    periodo_ini: {
        type: String
    },
    periodo_fim: {
        type: String
    },
    repetir:{
        type: String
    },
    tipo_cal:{
        type: String
    },
    lembrete:{
        type: String
    },
    tarefaId:{
        type: String
    }
})
banco.model('Usuarios', UsuariosSchema)
banco.model('Tarefas', TarefasSchema)
module.exports = TarefasSchema