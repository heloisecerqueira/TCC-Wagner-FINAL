const express = require('express');
const router = express.Router();
const db = require('../config/db');

async function criarTabelaPedidos() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NULL,
            nome_cliente VARCHAR(150) NULL,
            email_cliente VARCHAR(150) NULL,
            cor VARCHAR(100) NOT NULL,
            comprimento VARCHAR(100) NOT NULL,
            textura VARCHAR(100) NOT NULL,
            espessura VARCHAR(100) NOT NULL,
            adicionais TEXT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'Solicitação iniciada',
            data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function criarTabelaCarrinho() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS carrinho_itens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            cor VARCHAR(100) NOT NULL,
            comprimento VARCHAR(100) NOT NULL,
            textura VARCHAR(100) NOT NULL,
            espessura VARCHAR(100) NOT NULL,
            adicionais TEXT NULL,
            data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

router.post('/', async (req, res) => {
    try {
        const {
            usuario_id,
            nome_cliente,
            email_cliente,
            cor,
            comprimento,
            textura,
            espessura,
            adicionais
        } = req.body;

        if (!cor || !comprimento || !textura || !espessura) {
            return res.status(400).json({
                mensagem: 'Informe todas as opções de personalização.'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO pedidos
            (usuario_id, nome_cliente, email_cliente, cor, comprimento,
             textura, espessura, adicionais)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario_id || null,
                nome_cliente || null,
                email_cliente || null,
                cor,
                comprimento,
                textura,
                espessura,
                adicionais || null
            ]
        );

        res.status(201).json({
            mensagem: 'Solicitação de compra registrada com sucesso!',
            pedido_id: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao registrar pedido:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao registrar a solicitação de compra.'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const [pedidos] = await db.query(
            'SELECT * FROM pedidos ORDER BY data_pedido DESC'
        );

        res.json(pedidos);
    } catch (erro) {
        console.error('Erro ao buscar pedidos:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao buscar os pedidos.'
        });
    }
});

router.post('/carrinho', async (req, res) => {
    try {
        const {
            usuario_id,
            cor,
            comprimento,
            textura,
            espessura,
            adicionais
        } = req.body;

        if (!usuario_id || !cor || !comprimento || !textura || !espessura) {
            return res.status(400).json({
                mensagem: 'Informe o cliente e todas as opções de personalização.'
            });
        }

        const [usuarios] = await db.query(
            'SELECT id FROM usuarios WHERE id = ?',
            [usuario_id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado.'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO carrinho_itens
            (usuario_id, cor, comprimento, textura, espessura, adicionais)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                usuario_id,
                cor,
                comprimento,
                textura,
                espessura,
                adicionais || null
            ]
        );

        res.status(201).json({
            mensagem: 'Item salvo no carrinho!',
            item_id: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao salvar item no carrinho:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao salvar o item no carrinho.'
        });
    }
});

router.get('/carrinho/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [itens] = await db.query(
            `SELECT * FROM carrinho_itens
             WHERE usuario_id = ?
             ORDER BY data_adicao DESC`,
            [usuario_id]
        );

        res.json(itens);
    } catch (erro) {
        console.error('Erro ao consultar carrinho:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao consultar o carrinho.'
        });
    }
});

router.delete('/carrinho/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.query;

        if (!usuario_id) {
            return res.status(400).json({
                mensagem: 'Informe o cliente do carrinho.'
            });
        }

        const [resultado] = await db.query(
            `DELETE FROM carrinho_itens
             WHERE id = ? AND usuario_id = ?`,
            [id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Item não encontrado no carrinho deste cliente.'
            });
        }

        res.json({
            mensagem: 'Item removido do carrinho.'
        });
    } catch (erro) {
        console.error('Erro ao remover item do carrinho:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao remover o item do carrinho.'
        });
    }
});

router.criarTabelaPedidos = criarTabelaPedidos;
router.criarTabelaCarrinho = criarTabelaCarrinho;

module.exports = router;
