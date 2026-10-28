const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const usuariosRoutes = require('./routes/usuarios');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Wagner Oliveira Mega Hair funcionando!');
});

app.get('/api/teste-banco', async (req, res) => {
    try {
        const [resultado] = await db.query('SELECT 1 AS conectado');

        res.json({
            mensagem: 'API conectada ao MySQL com sucesso!',
            banco: resultado[0].conectado
        });
    } catch (erro) {
        console.error('Erro ao conectar ao banco:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao conectar ao banco de dados.'
        });
    }
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await db.query('SELECT 1');

        await usuariosRoutes.criarContaProfissional();
        await pedidosRoutes.criarTabelaPedidos();
        await pedidosRoutes.criarTabelaCarrinho();

        app.listen(PORT, () => {
            console.log(`API rodando em http://localhost:${PORT}`);
        });
    } catch (erro) {
    console.error('Erro ao iniciar o servidor:', erro);
    process.exit(1);
}
}

iniciarServidor();
