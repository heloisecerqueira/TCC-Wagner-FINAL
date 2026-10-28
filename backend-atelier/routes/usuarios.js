const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const db = require('../config/db');

// Dados da conta profissional
const EMAIL_PROFISSIONAL = 'wagner.oliveira@gmail.com';
const SENHA_PROFISSIONAL = 'Wagner@2026';

// Criar a conta profissional automaticamente
async function criarContaProfissional() {
    try {
        const [usuarios] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [EMAIL_PROFISSIONAL]
        );

        if (usuarios.length > 0) {
            const senhaHash = await bcrypt.hash(SENHA_PROFISSIONAL, 10);

            await db.query(
                'UPDATE usuarios SET tipo = ?, senha = ? WHERE email = ?',
                ['admin', senhaHash, EMAIL_PROFISSIONAL]
            );

            console.log('Conta profissional atualizada com sucesso!');
            return;
        }

        const senhaHash = await bcrypt.hash(SENHA_PROFISSIONAL, 10);

        await db.query(
            `INSERT INTO usuarios (nome, email, senha, telefone, tipo)
             VALUES (?, ?, ?, ?, ?)`,
            [
                'Wagner Oliveira',
                EMAIL_PROFISSIONAL,
                senhaHash,
                null,
                'admin'
            ]
        );

        console.log('Conta profissional criada com sucesso!');
    } catch (erro) {
        console.error('Erro ao configurar conta profissional:', erro.message);
    }
}

// Listar usuários
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT id, nome, email, telefone, tipo FROM usuarios'
        );

        res.json(usuarios);
    } catch (erro) {
        console.error(erro.message);

        res.status(500).json({
            mensagem: 'Erro ao buscar usuários.'
        });
    }
});

// Cadastrar usuário comum
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, telefone } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                mensagem: 'Nome, e-mail e senha são obrigatórios.'
            });
        }

        const [existentes] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Este e-mail já está cadastrado.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const [resultado] = await db.query(
            `INSERT INTO usuarios (nome, email, senha, telefone)
             VALUES (?, ?, ?, ?)`,
            [nome, email, senhaHash, telefone || null]
        );

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        console.error(erro.message);

        res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário.'
        });
    }
});

// Fazer login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'E-mail e senha são obrigatórios.'
            });
        }

        const [usuarios] = await db.query(
            `SELECT id, nome, email, senha, telefone, tipo
             FROM usuarios
             WHERE email = ?`,
            [email.trim()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        const usuario = usuarios[0];

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        res.json({
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                tipo: usuario.tipo
            }
        });
    } catch (erro) {
        console.error(erro.message);

        res.status(500).json({
            mensagem: 'Erro ao realizar login.'
        });
    }
});

// Disponibilizar a função para o servidor executar na inicialização
router.criarContaProfissional = criarContaProfissional;

module.exports = router;