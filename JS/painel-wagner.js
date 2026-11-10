const dadosIniciais = {
  perfil: {
    nome: "Wagner Oliveira",
    especialidade: "Mega Hair Premium",
    email: "wagner.oliveira@gmail.com",
    telefone: "(71) 99999-0000",
    sobre: "Fios 100% naturais, personalizados e de produção artesanal."
  },
  inventario: [
    { id: 1, nome: "Loiro Platinado 60cm", sku: "LP-60", quantidade: 45, minimo: 20, preco: 280, categoria: "Produto" },
    { id: 2, nome: "Castanho Médio 50cm", sku: "CM-50", quantidade: 12, minimo: 20, preco: 240, categoria: "Produto" },
    { id: 3, nome: "Preto Natural 60cm", sku: "PN-60", quantidade: 2, minimo: 20, preco: 260, categoria: "Produto" },
    { id: 4, nome: "Ruivo Queimado 55cm", sku: "RQ-55", quantidade: 78, minimo: 20, preco: 270, categoria: "Produto" },
    { id: 5, nome: "Loiro Mel 50cm", sku: "LM-50", quantidade: 0, minimo: 20, preco: 250, categoria: "Produto" }
  ],
  producao: [
    { id: 6, nome: "Cola de Queratina Italiana", sku: "CQ-IT-01", quantidade: 45, minimo: 20, preco: 12.5, categoria: "Insumo" },
    { id: 7, nome: "Fita Adesiva Double Face", sku: "FA-DF-05", quantidade: 8, minimo: 15, preco: 240, categoria: "Insumo" },
    { id: 8, nome: "Máquina de Costura", sku: "MC-IND-02", quantidade: 1, minimo: 2, preco: 260, categoria: "Maquinário" },
    { id: 9, nome: "Tela de Micropele", sku: "TM-MP-10", quantidade: 120, minimo: 50, preco: 270, categoria: "Em Produção" }
  ],
  notificacoes: [],
  lotes: 8
};

let dados;

try {
  dados = JSON.parse(localStorage.getItem("painelWagner")) || dadosIniciais;
} catch (erro) {
  dados = dadosIniciais;
}

if (!Array.isArray(dados.notificacoes)) {
  dados.notificacoes = [];
}

let paginaAtual = "perfil";
let filtroAtual = "Todos";
let buscaAtual = "";
let itemEditando = null;
let temporizadorMensagem;
let sincronizandoPedidos = false;

const conteudo = document.querySelector("#conteudo");
const tituloPagina = document.querySelector("#titulo-pagina");
const descricaoPagina = document.querySelector("#descricao-pagina");
const botaoNovo = document.querySelector("#novo-item");
const modalFundo = document.querySelector("#modal-fundo");
const formulario = document.querySelector("#form-item");

function salvarDados() {
  localStorage.setItem("painelWagner", JSON.stringify(dados));
}

function mostrarMensagem(texto) {
  const mensagem = document.querySelector("#mensagem");
  mensagem.textContent = texto;
  mensagem.style.display = "block";

  clearTimeout(temporizadorMensagem);

  temporizadorMensagem = setTimeout(() => {
    mensagem.style.display = "none";
  }, 2200);
}

function formatarDinheiro(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[caractere]));
}

function statusItem(item) {
  if (item.quantidade === 0) return ["critico", "Sem estoque"];
  if (item.quantidade < item.minimo) return ["baixo", "Baixo"];

  return ["disponivel", "Disponível"];
}

function desenharCartoes(cartoes) {
  return `
    <div class="cartoes">
      ${cartoes.map(cartao => `
        <div class="cartao">
          <small>${cartao.nome}</small>
          <strong>${cartao.valor}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function adicionarNotificacao(titulo, texto, pedidoId = null) {
  dados.notificacoes.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    pedidoId,
    titulo,
    texto,
    tempo: new Date().toLocaleString("pt-BR"),
    lida: false
  });

  salvarDados();
}

async function sincronizarPedidos() {
  if (sincronizandoPedidos) return;

  sincronizandoPedidos = true;

  try {
    const resposta = await fetch("http://localhost:3000/api/pedidos");

    if (!resposta.ok) {
      throw new Error("Não foi possível consultar os pedidos.");
    }

    const pedidos = await resposta.json();

    if (!Array.isArray(pedidos)) {
      throw new Error("A API retornou uma resposta inesperada.");
    }

    let encontrouNovidade = false;

    pedidos.forEach(pedido => {
      const idPedido = Number(pedido.id);

      const jaExiste = dados.notificacoes.some(
        notificacao => Number(notificacao.pedidoId) === idPedido
      );

      if (jaExiste) return;

      const cliente = pedido.nome_cliente || "Cliente não identificado";

      const texto =
        `${cliente} iniciou uma solicitação de compra. ` +
        `Cor: ${pedido.cor}; comprimento: ${pedido.comprimento}; ` +
        `textura: ${pedido.textura}; espessura: ${pedido.espessura}.`;

      adicionarNotificacao(
        `Pedido #${pedido.id} — nova solicitação`,
        texto,
        idPedido
      );

      encontrouNovidade = true;
    });

    if (encontrouNovidade) {
      if (paginaAtual === "notificacoes") {
        renderizarPagina();
      } else {
        atualizarContadorNotificacoes();
      }
    }
  } catch (erro) {
    console.error("Erro ao sincronizar pedidos:", erro.message);
  } finally {
    sincronizandoPedidos = false;
  }
}

function atualizarContadorNotificacoes() {
  const contador = document.querySelector("#contador");

  if (contador) {
    contador.textContent = dados.notificacoes.filter(n => !n.lida).length;
  }
}

function abrirPagina(pagina) {
  paginaAtual = pagina;
  filtroAtual = "Todos";
  buscaAtual = "";

  document.querySelectorAll(".nav-btn").forEach(botao => {
    botao.classList.toggle(
      "ativo",
      botao.dataset.pagina === pagina
    );
  });

  const paginas = {
    perfil: [
      "Perfil Profissional",
      "Seus dados e visão geral do ateliê"
    ],
    inventario: [
      "Inventário",
      "Gerenciar estoque de mega hair"
    ],
    producao: [
      "Produção",
      "Gerenciar materiais e fluxo de produção"
    ],
    notificacoes: [
      "Notificações",
      "Acompanhe pedidos, estoque e atualizações"
    ]
  };

  tituloPagina.textContent = paginas[pagina][0];
  descricaoPagina.textContent = paginas[pagina][1];

  botaoNovo.hidden = !["inventario", "producao"].includes(pagina);

  botaoNovo.textContent =
    pagina === "producao" ? "+ Novo material" : "+ Novo produto";

  renderizarPagina();

  if (pagina === "notificacoes") {
    sincronizarPedidos();
  }
}

function renderizarPagina() {
  if (paginaAtual === "perfil") renderizarPerfil();
  if (paginaAtual === "inventario") renderizarLista("inventario");
  if (paginaAtual === "producao") renderizarLista("producao");
  if (paginaAtual === "notificacoes") renderizarNotificacoes();

  atualizarContadorNotificacoes();
  salvarDados();
}

function renderizarPerfil() {
  const p = dados.perfil;

  const iniciais = p.nome
    .split(" ")
    .map(palavra => palavra[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const criticos = [...dados.inventario, ...dados.producao]
    .filter(item => item.quantidade < item.minimo).length;

  conteudo.innerHTML = `
    ${desenharCartoes([
      {
        nome: "Pedidos novos",
        valor: dados.notificacoes.filter(
          n => !n.lida && n.titulo.includes("Pedido")
        ).length
      },
      {
        nome: "Estoque total",
        valor: dados.inventario.reduce(
          (soma, item) => soma + item.quantidade, 0
        ) + "g"
      },
      {
        nome: "Itens críticos",
        valor: criticos
      },
      {
        nome: "Lotes em produção",
        valor: dados.lotes
      }
    ])}

    <section class="painel">
      <div class="grid">
        <div>
          <h2>
            <span class="logo">${escapar(iniciais)}</span>
            ${escapar(p.nome)}
          </h2>
          <p>${escapar(p.especialidade)}</p>
        </div>

        <div></div>

        <div>
          <label for="perfil-nome">Nome</label>
          <input id="perfil-nome" value="${escapar(p.nome)}">
        </div>

        <div>
          <label for="perfil-especialidade">Especialidade</label>
          <input id="perfil-especialidade" value="${escapar(p.especialidade)}">
        </div>

        <div>
          <label for="perfil-email">E-mail</label>
          <input id="perfil-email" type="email" value="${escapar(p.email)}">
        </div>

        <div>
          <label for="perfil-telefone">Telefone</label>
          <input id="perfil-telefone" value="${escapar(p.telefone)}">
        </div>
      </div>

      <label for="perfil-sobre">Sobre</label>
      <input id="perfil-sobre" value="${escapar(p.sobre)}">

      <p>
        <button id="salvar-perfil" class="botao">
          Salvar alterações
        </button>
      </p>
    </section>

    <section class="painel">
      <h3>Agenda de hoje</h3>
      <div class="agenda-linha"><strong>09:00</strong> Aplicação — Mariana Silva</div>
      <div class="agenda-linha"><strong>11:30</strong> Avaliação de cor — Aline Teixeira</div>
      <div class="agenda-linha"><strong>15:00</strong> Manutenção — Bia Santos</div>
    </section>
  `;

  document.querySelector("#salvar-perfil").addEventListener("click", () => {
    dados.perfil = {
      nome: document.querySelector("#perfil-nome").value.trim() || p.nome,
      especialidade: document.querySelector("#perfil-especialidade").value.trim(),
      email: document.querySelector("#perfil-email").value.trim(),
      telefone: document.querySelector("#perfil-telefone").value.trim(),
      sobre: document.querySelector("#perfil-sobre").value.trim()
    };

    renderizarPagina();
    mostrarMensagem("Perfil atualizado!");
  });
}

function renderizarLista(tipo) {
  const itens = dados[tipo];

  const filtrados = itens.filter(item => {
    const correspondeBusca = (item.nome + " " + item.sku)
      .toLowerCase()
      .includes(buscaAtual.toLowerCase());

    const status = statusItem(item)[1];

    const correspondeFiltro =
      filtroAtual === "Todos" ||
      status === filtroAtual ||
      item.categoria === filtroAtual;

    return correspondeBusca && correspondeFiltro;
  });

  const total = itens.reduce(
    (soma, item) => soma + item.quantidade, 0
  );

  const valor = itens.reduce(
    (soma, item) => soma + item.quantidade * item.preco, 0
  );

  const alertas = itens.filter(
    item => item.quantidade < item.minimo
  ).length;

  const filtros = tipo === "inventario"
    ? ["Todos", "Disponível", "Baixo", "Sem estoque"]
    : ["Todos", "Insumo", "Maquinário", "Em Produção"];

  conteudo.innerHTML = `
    <section class="painel">
      <h3>Filtros</h3>

      <label for="busca">Buscar por nome ou SKU</label>
      <input
        id="busca"
        placeholder="Digite para pesquisar..."
        value="${escapar(buscaAtual)}"
      >

      <div class="filtros">
        ${filtros.map(filtro => `
          <button
            class="filtro ${filtroAtual === filtro ? "ativo" : ""}"
            data-filtro="${filtro}"
          >
            ${filtro}
          </button>
        `).join("")}
      </div>
    </section>

    <section class="painel tabela-wrap">
      <table>
        <thead>
          <tr>
            <th>${tipo === "inventario" ? "Produto" : "Material"}</th>
            <th>SKU</th>
            <th>Quantidade</th>
            <th>Preço/custo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          ${filtrados.map(item => {
            const status = statusItem(item);

            return `
              <tr>
                <td>
                  <strong>${escapar(item.nome)}</strong>
                  <small>${escapar(item.categoria)}</small>
                </td>
                <td>${escapar(item.sku)}</td>
                <td>
                  ${item.quantidade}${tipo === "inventario" ? "g" : " un"}
                  <small>Mínimo: ${item.minimo}</small>
                </td>
                <td>${formatarDinheiro(item.preco)}</td>
                <td>
                  <span class="status ${status[0]}">${status[1]}</span>
                </td>
                <td>
                  <div class="acoes-tabela">
                    <button class="acao" data-editar="${item.id}">Editar</button>
                    <button class="acao" data-excluir="${item.id}">Excluir</button>
                  </div>
                </td>
              </tr>
            `;
          }).join("") || `
            <tr>
              <td colspan="6" class="vazio">Nenhum item encontrado.</td>
            </tr>
          `}
        </tbody>
      </table>
    </section>

    ${desenharCartoes([
      {
        nome: tipo === "inventario" ? "Total em estoque" : "Total de materiais",
        valor: total
      },
      {
        nome: tipo === "inventario" ? "Produtos" : "Lotes em produção",
        valor: tipo === "inventario" ? itens.length : dados.lotes
      },
      {
        nome: "Itens em alerta",
        valor: alertas
      },
      {
        nome: "Valor total",
        valor: formatarDinheiro(valor)
      }
    ])}
  `;

  document.querySelector("#busca").addEventListener("input", evento => {
    buscaAtual = evento.target.value;

    const posicao = evento.target.selectionStart;

    renderizarLista(tipo);

    const campo = document.querySelector("#busca");
    campo.focus();
    campo.setSelectionRange(posicao, posicao);
  });

  document.querySelectorAll("[data-filtro]").forEach(botao => {
    botao.addEventListener("click", () => {
      filtroAtual = botao.dataset.filtro;
      renderizarLista(tipo);
    });
  });

  document.querySelectorAll("[data-editar]").forEach(botao => {
    botao.addEventListener("click", () => {
      const item = itens.find(
        registro => registro.id === Number(botao.dataset.editar)
      );

      abrirModal(item);
    });
  });

  document.querySelectorAll("[data-excluir]").forEach(botao => {
    botao.addEventListener("click", () => {
      const item = itens.find(
        registro => registro.id === Number(botao.dataset.excluir)
      );

      if (confirm(`Deseja excluir "${item.nome}"?`)) {
        dados[tipo] = dados[tipo].filter(
          registro => registro.id !== item.id
        );

        renderizarPagina();
        mostrarMensagem("Item excluído.");
      }
    });
  });
}

function renderizarNotificacoes() {
  const naoLidas = dados.notificacoes.filter(n => !n.lida).length;

  conteudo.innerHTML = `
    <section class="painel">
      <button id="marcar-lidas" class="botao">
        Marcar todas como lidas (${naoLidas})
      </button>
    </section>

    ${dados.notificacoes.map(n => `
      <article class="notificacao">
        <small>${n.lida ? "Lida" : "Nova"} · ${escapar(n.tempo)}</small>
        <h3>${escapar(n.titulo)}</h3>
        <p>${escapar(n.texto)}</p>

        <p>
          <button class="acao" data-ler="${n.id}">
            ${n.lida ? "Já lida" : "Marcar como lida"}
          </button>

          <button class="acao" data-apagar-notificacao="${n.id}">
            Excluir
          </button>
        </p>
      </article>
    `).join("") || `
      <section class="painel">
        <p class="vazio">Nenhuma notificação no momento.</p>
      </section>
    `}
  `;

  document.querySelector("#marcar-lidas").addEventListener("click", () => {
    dados.notificacoes.forEach(n => n.lida = true);
    renderizarPagina();
    mostrarMensagem("Notificações marcadas como lidas.");
  });

  document.querySelectorAll("[data-ler]").forEach(botao => {
    botao.addEventListener("click", () => {
      const notificacao = dados.notificacoes.find(
        n => n.id === Number(botao.dataset.ler)
      );

      if (notificacao) {
        notificacao.lida = true;
        renderizarPagina();
      }
    });
  });

  document.querySelectorAll("[data-apagar-notificacao]").forEach(botao => {
    botao.addEventListener("click", () => {
      dados.notificacoes = dados.notificacoes.filter(
        n => n.id !== Number(botao.dataset.apagarNotificacao)
      );

      renderizarPagina();
      mostrarMensagem("Notificação excluída.");
    });
  });
}

function abrirModal(item = null) {
  itemEditando = item ? item.id : null;

  document.querySelector("#modal-titulo").textContent =
    item ? "Editar item" : "Novo item";

  document.querySelector("#nome-item").value = item ? item.nome : "";
  document.querySelector("#sku-item").value = item ? item.sku : "";
  document.querySelector("#quantidade-item").value = item ? item.quantidade : 0;
  document.querySelector("#minimo-item").value = item ? item.minimo : 1;
  document.querySelector("#preco-item").value = item ? item.preco : 0;

  document.querySelector("#categoria-item").value = item
    ? item.categoria
    : (paginaAtual === "producao" ? "Insumo" : "Produto");

  modalFundo.hidden = false;
  document.querySelector("#nome-item").focus();
}

function fecharModal() {
  modalFundo.hidden = true;
  formulario.reset();
  itemEditando = null;
}

formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  const itens = dados[paginaAtual];

  const item = {
    id: itemEditando || Date.now(),
    nome: document.querySelector("#nome-item").value.trim(),
    sku: document.querySelector("#sku-item").value.trim(),
    quantidade: Number(document.querySelector("#quantidade-item").value),
    minimo: Number(document.querySelector("#minimo-item").value),
    preco: Number(document.querySelector("#preco-item").value),
    categoria: document.querySelector("#categoria-item").value
  };

  if (itemEditando) {
    dados[paginaAtual] = itens.map(registro =>
      registro.id === itemEditando ? item : registro
    );
  } else {
    dados[paginaAtual].push(item);
  }

  fecharModal();
  renderizarPagina();
  mostrarMensagem("Item salvo com sucesso!");
});

document.querySelector("#cancelar-modal").addEventListener("click", fecharModal);

modalFundo.addEventListener("click", evento => {
  if (evento.target === modalFundo) fecharModal();
});

document.querySelector("#novo-item").addEventListener("click", () => abrirModal());

document.querySelectorAll(".nav-btn").forEach(botao => {
  botao.addEventListener("click", () => abrirPagina(botao.dataset.pagina));
});

abrirPagina("perfil");

sincronizarPedidos();
setInterval(sincronizarPedidos, 10000);
