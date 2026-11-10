const listaCabelosCatalogo = [
    { nome: "Loiro Mel", imagem: "../PNG/catalogoloiromel.webp" },
    { nome: "Castanho Escuro", imagem: "../PNG/catalogocastanhoescuro.webp" },
    { nome: "Loiro Platinado", imagem: "../PNG/catalogoloiroplatinado.webp" },
    { nome: "Preto Natural", imagem: "../PNG/catalogopreto.jpg" },
    { nome: "Castanho Médio", imagem: "../PNG/catalogocastanhoescuro.webp" },
    { nome: "Loiro Claro", imagem: "../PNG/catalogoloiroclaro.webp" }
];

function obterUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem("usuarioLogado")) || null;
    } catch {
        return null;
    }
}

function obterChaveCarrinho() {
    const usuario = obterUsuarioLogado();

    if (usuario) {
        const identificador = usuario.id || usuario.email;

        if (identificador) {
            return `carrinhoMegaHair_usuario_${identificador}`;
        }
    }

    return "carrinhoMegaHair_visitante";
}

function lerCarrinho() {
    const chave = obterChaveCarrinho();

    try {
        const itens = JSON.parse(localStorage.getItem(chave));

        if (Array.isArray(itens)) {
            return itens;
        }
    } catch {
        localStorage.removeItem(chave);
    }

    const carrinhoAntigo = localStorage.getItem("megaHairPersonalizado");

    if (carrinhoAntigo) {
        try {
            const itemAntigo = JSON.parse(carrinhoAntigo);

            if (itemAntigo && itemAntigo.cor) {
                const itemMigrado = {
                    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    ...itemAntigo
                };

                salvarCarrinho([itemMigrado]);
                localStorage.removeItem("megaHairPersonalizado");

                return [itemMigrado];
            }
        } catch {
            localStorage.removeItem("megaHairPersonalizado");
        }
    }

    return [];
}

function salvarCarrinho(itens) {
    localStorage.setItem(obterChaveCarrinho(), JSON.stringify(itens));
}

function transferirCarrinhoVisitanteParaUsuario(usuario) {
    if (!usuario) return;

    const identificador = usuario.id || usuario.email;

    if (!identificador) return;

    const chaveUsuario = `carrinhoMegaHair_usuario_${identificador}`;
    const chaveVisitante = "carrinhoMegaHair_visitante";

    let itensVisitante = [];

    try {
        itensVisitante = JSON.parse(localStorage.getItem(chaveVisitante)) || [];
    } catch {
        itensVisitante = [];
    }

    let itensUsuario = [];

    try {
        itensUsuario = JSON.parse(localStorage.getItem(chaveUsuario)) || [];
    } catch {
        itensUsuario = [];
    }

    if (itensVisitante.length > 0) {
        salvarCarrinhoNaChave(
            chaveUsuario,
            [...itensUsuario, ...itensVisitante]
        );

        localStorage.removeItem(chaveVisitante);
    }
}

function salvarCarrinhoNaChave(chave, itens) {
    localStorage.setItem(chave, JSON.stringify(itens));
}

function carregarPaginaCatalogo() {
    const gridCatalogo = document.getElementById("grid-produtos-catalogo");

    if (!gridCatalogo) return;

    gridCatalogo.innerHTML = "";

    listaCabelosCatalogo.forEach(cabelo => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${cabelo.imagem}" alt="${cabelo.nome}">
            <h3>${cabelo.nome}</h3>
            <p>Cabelo de alta qualidade, fios selecionados, perfeito para alongamento e volume.</p>
            <span class="price">A partir de R$ 350,00</span>
            <button class="btn-card" onclick="window.location.href='personalizar.html'">
                PERSONALIZAR
            </button>
        `;

        gridCatalogo.appendChild(card);
    });
}

function atualizarEspecificacoesDaPagina() {
    const campoCor = document.getElementById("change-cor");
    const campoComprimento = document.getElementById("change-comprimento");
    const campoTextura = document.getElementById("change-textura");
    const campoEspessura = document.getElementById("change-espessura");

    if (campoCor && document.getElementById("resumo-cor")) {
        document.getElementById("resumo-cor").innerText = campoCor.value;

        const nomeProduto = document.getElementById("custom-product-name");

        if (nomeProduto) {
            nomeProduto.innerText = campoCor.value + " Premium";
        }

        const containerImagem = document.getElementById("custom-product-image");

        if (containerImagem) {
            const cabeloEncontrado = listaCabelosCatalogo.find(
                cabelo => cabelo.nome === campoCor.value
            );

            if (cabeloEncontrado) {
                containerImagem.innerHTML = `
                    <img
                        src="${cabeloEncontrado.imagem}"
                        alt="${cabeloEncontrado.nome}"
                        style="width:100%;height:100%;object-fit:cover;"
                    >
                `;
            }
        }
    }

    if (campoComprimento && document.getElementById("resumo-comprimento")) {
        document.getElementById("resumo-comprimento").innerText = campoComprimento.value;
    }

    if (campoTextura && document.getElementById("resumo-textura")) {
        document.getElementById("resumo-textura").innerText = campoTextura.value;
    }

    if (campoEspessura && document.getElementById("resumo-espessura")) {
        document.getElementById("resumo-espessura").innerText = campoEspessura.value;
    }
}

function salvarEAvancar() {
    const campoCor = document.getElementById("change-cor");
    const campoComprimento = document.getElementById("change-comprimento");
    const campoTextura = document.getElementById("change-textura");
    const campoEspessura = document.getElementById("change-espessura");
    const campoAdicionais = document.getElementById("change-adicionais");

    if (!campoCor || !campoComprimento || !campoTextura || !campoEspessura) {
        return;
    }

    const megaHairCustomizado = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        cor: campoCor.value,
        comprimento: campoComprimento.value,
        textura: campoTextura.value,
        espessura: campoEspessura.value,
        adicionais: campoAdicionais ? campoAdicionais.value.trim() : ""
    };

    const itensCarrinho = lerCarrinho();

    itensCarrinho.push(megaHairCustomizado);

    salvarCarrinho(itensCarrinho);

    atualizarConteudoDoCarrinho();
    abrirCarrinhoLateral();
}

function injetarEstruturaDoCarrinho() {
    if (document.getElementById("carrinho-lateral-container")) return;

    const wrapperCarrinho = document.createElement("div");
    wrapperCarrinho.id = "carrinho-lateral-container";

    wrapperCarrinho.style.cssText = `
        position: fixed;
        top: 0;
        right: -400px;
        width: 100%;
        max-width: 400px;
        height: 100vh;
        background-color: #0d0d0d;
        border-left: 1px solid #222;
        box-shadow: -5px 0 25px rgba(0,0,0,0.8);
        z-index: 100000;
        display: flex;
        flex-direction: column;
        transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Lato', sans-serif;
        box-sizing: border-box;
    `;

    const headerCarrinho = document.createElement("div");

    headerCarrinho.style.cssText = `
        padding: 25px;
        border-bottom: 1px solid #1f1f1f;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    headerCarrinho.innerHTML = `
        <h3 style="font-family:'Playfair Display',serif;color:#fff;margin:0;font-size:1.4rem;">
            Meu Carrinho
        </h3>
        <button onclick="fecharCarrinhoLateral()" style="background:none;border:none;color:#bfa15f;font-size:1.5rem;cursor:pointer;padding:5px;">
            <i class="bi bi-x-lg"></i>
        </button>
    `;

    const corpoCarrinho = document.createElement("div");
    corpoCarrinho.id = "carrinho-lateral-corpo";

    corpoCarrinho.style.cssText = `
        padding: 25px;
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

    wrapperCarrinho.appendChild(headerCarrinho);
    wrapperCarrinho.appendChild(corpoCarrinho);
    document.body.appendChild(wrapperCarrinho);

    const backgroundOverlay = document.createElement("div");
    backgroundOverlay.id = "carrinho-overlay-fundo";

    backgroundOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.6);
        z-index: 99999;
        display: none;
        backdrop-filter: blur(2px);
    `;

    backgroundOverlay.addEventListener("click", fecharCarrinhoLateral);
    document.body.appendChild(backgroundOverlay);

    document.querySelectorAll(".bi-cart").forEach(btn => {
        const elementoPai = btn.closest("button") || btn.closest("a");

        if (elementoPai) {
            elementoPai.addEventListener("click", evento => {
                evento.preventDefault();
                atualizarConteudoDoCarrinho();
                abrirCarrinhoLateral();
            });
        }
    });

    atualizarConteudoDoCarrinho();
}

function abrirCarrinhoLateral() {
    const carrinho = document.getElementById("carrinho-lateral-container");
    const overlay = document.getElementById("carrinho-overlay-fundo");

    if (carrinho) carrinho.style.right = "0";
    if (overlay) overlay.style.display = "block";
}

function fecharCarrinhoLateral() {
    const carrinho = document.getElementById("carrinho-lateral-container");
    const overlay = document.getElementById("carrinho-overlay-fundo");

    if (carrinho) carrinho.style.right = "-400px";
    if (overlay) overlay.style.display = "none";
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

function montarMensagemWhatsApp(itens) {
    let mensagem =
        "Olá Atelier Wagner Oliveira! Gostaria de finalizar a compra dos meus Mega Hairs personalizados.\n\n";

    itens.forEach((item, indice) => {
        mensagem +=
            `*Item ${indice + 1} - Mega Hair Luxo*\n` +
            `- Cor: ${item.cor}\n` +
            `- Comprimento: ${item.comprimento}\n` +
            `- Textura: ${item.textura}\n` +
            `- Espessura: ${item.espessura}\n` +
            `- Observações adicionais: ${item.adicionais || "Nenhuma"}\n\n`;
    });

    return mensagem;
}

function atualizarConteudoDoCarrinho() {
    const corpo = document.getElementById("carrinho-lateral-corpo");

    if (!corpo) return;

    const itens = lerCarrinho();

    if (itens.length === 0) {
        corpo.innerHTML = `
            <div style="text-align:center;margin-top:60px;color:#555;">
                <i class="bi bi-cart-x" style="font-size:3.5rem;display:block;margin-bottom:15px;color:#222;"></i>
                <p style="font-size:0.95rem;margin-bottom:20px;color:#888;">
                    Seu carrinho está vazio.
                </p>
                <a href="personalizar.html" onclick="fecharCarrinhoLateral()" class="btn-gold" style="display:inline-block;padding:10px 25px;text-decoration:none;font-size:0.85rem;">
                    MONTAR SOB MEDIDA
                </a>
            </div>
        `;

        return;
    }

    const mensagemZap = encodeURIComponent(montarMensagemWhatsApp(itens));

    const cartoes = itens.map((dados, indice) => `
        <div style="background:#141414;border:1px solid #222;border-radius:6px;padding:20px;position:relative;">
            <button
                onclick="removerItemDoCarrinho('${escaparHTML(dados.id)}')"
                title="Remover este item"
                aria-label="Remover item ${indice + 1}"
                style="position:absolute;top:15px;right:15px;background:none;border:none;color:#bfa15f;font-size:1.1rem;cursor:pointer;"
            >
                <i class="bi bi-trash3"></i>
            </button>

            <div style="display:flex;gap:15px;align-items:center;margin-bottom:15px;padding-right:25px;">
                <div style="background:#222;width:50px;height:50px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:4px;color:#bfa15f;font-size:1.5rem;">
                    <i class="bi bi-gem"></i>
                </div>
                <div>
                    <h4 style="margin:0;color:#fff;font-family:'Playfair Display',serif;font-size:1.1rem;">
                        Mega Hair Luxo
                    </h4>
                    <span style="color:#bfa15f;font-size:0.75rem;letter-spacing:1px;font-weight:bold;">
                        ITEM ${indice + 1} · SOB MEDIDA
                    </span>
                </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;border-top:1px solid #1f1f1f;padding-top:15px;font-size:0.9rem;color:#b3b3b3;">
                <p style="margin:0;"><strong style="color:#888;">Cor:</strong> ${escaparHTML(dados.cor)}</p>
                <p style="margin:0;"><strong style="color:#888;">Comprimento:</strong> ${escaparHTML(dados.comprimento)}</p>
                <p style="margin:0;"><strong style="color:#888;">Textura:</strong> ${escaparHTML(dados.textura)}</p>
                <p style="margin:0;"><strong style="color:#888;">Espessura:</strong> ${escaparHTML(dados.espessura)}</p>

                <div style="background:#1a1a1a;padding:10px;border-radius:4px;margin-top:5px;font-size:0.85rem;border-left:2px solid #bfa15f;">
                    <span style="display:block;font-size:0.7rem;font-weight:bold;color:#888;margin-bottom:2px;">
                        EXTRAS
                    </span>
                    <span style="font-style:italic;color:#b3b3b3;">
                        ${dados.adicionais ? escaparHTML(dados.adicionais) : "Nenhuma observação informada."}
                    </span>
                </div>
            </div>
        </div>
    `).join("");

    corpo.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;color:#b3b3b3;font-size:0.9rem;">
            <span>Itens no carrinho</span>
            <strong style="color:#bfa15f;">${itens.length}</strong>
        </div>

        ${cartoes}

        <div style="margin-top:auto;padding-top:10px;">
            <a
                href="https://wa.me/5511999998888?text=${mensagemZap}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-gold"
                style="display:block;text-align:center;font-size:0.9rem;padding:14px;text-decoration:none;box-sizing:border-box;font-weight:bold;"
                onclick="registrarPedidoEProsseguir(event, this)"
            >
                PROSSEGUIR PARA COMPRAR <span>▶</span>
            </a>
        </div>
    `;
}

async function registrarPedidoEProsseguir(evento, link) {
    evento.preventDefault();

    const itens = lerCarrinho();

    if (itens.length === 0) {
        alert("Seu carrinho está vazio.");
        atualizarConteudoDoCarrinho();
        return;
    }

    const usuario = obterUsuarioLogado();

    const janelaWhatsApp = window.open("about:blank", "_blank");

    if (!janelaWhatsApp) {
        alert("Permita a abertura de novas janelas no navegador para continuar.");
        return;
    }

    janelaWhatsApp.document.write(
        "<p style='font-family:Arial,sans-serif;padding:20px'>Registrando sua solicitação de compra...</p>"
    );

    link.style.pointerEvents = "none";
    link.style.opacity = "0.6";

    try {
        for (const item of itens) {
            const dadosPedido = {
                usuario_id: usuario?.id || null,
                nome_cliente: usuario?.nome || null,
                email_cliente: usuario?.email || null,
                cor: item.cor,
                comprimento: item.comprimento,
                textura: item.textura,
                espessura: item.espessura,
                adicionais: item.adicionais || ""
            };

            const resposta = await fetch("http://localhost:3000/api/pedidos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosPedido)
            });

            let resultado = {};

            try {
                resultado = await resposta.json();
            } catch {
                resultado = {};
            }

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem || "Não foi possível registrar todos os itens."
                );
            }
        }

        janelaWhatsApp.location.href = link.href;

    } catch (erro) {
        console.error("Erro ao registrar solicitação:", erro);

        janelaWhatsApp.close();

        alert(
            "Não foi possível registrar sua solicitação no sistema. " +
            "Verifique se o servidor está rodando e tente novamente."
        );
    } finally {
        link.style.pointerEvents = "auto";
        link.style.opacity = "1";
    }
}

function removerItemDoCarrinho(id) {
    const itens = lerCarrinho();
    const itensAtualizados = itens.filter(item => String(item.id) !== String(id));

    salvarCarrinho(itensAtualizados);
    atualizarConteudoDoCarrinho();
}

document.addEventListener("DOMContentLoaded", () => {
    carregarPaginaCatalogo();
    inicializarControlesLogin();
    atualizarEspecificacoesDaPagina();
    injetarEstruturaDoCarrinho();
});

function inicializarControlesLogin() {
    const cardLogin = document.getElementById("card-login");
    const cardCadastro = document.getElementById("card-cadastro");

    if (!cardLogin || !cardCadastro) return;

    const linkIrCadastro = document.getElementById("link-ir-cadastro");
    const linkVoltarLogin = document.getElementById("link-voltar-login");
    const formLogin = document.getElementById("form-efetuar-login");
    const formCadastro = document.getElementById("form-criar-cadastro");

    linkIrCadastro?.addEventListener("click", evento => {
        evento.preventDefault();
        cardLogin.style.display = "none";
        cardCadastro.style.display = "block";
    });

    linkVoltarLogin?.addEventListener("click", evento => {
        evento.preventDefault();
        cardCadastro.style.display = "none";
        cardLogin.style.display = "block";
    });

    formCadastro?.addEventListener("submit", async evento => {
        evento.preventDefault();

        const nome = document.getElementById("cadastro-nome").value.trim();
        const email = document.getElementById("cadastro-email").value.trim();
        const telefone = document.getElementById("cadastro-telefone").value.trim();
        const senha = document.getElementById("cadastro-senha").value;

        try {
            const resposta = await fetch("http://localhost:3000/api/usuarios/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    email,
                    telefone,
                    senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.mensagem || "Não foi possível realizar o cadastro.");
                return;
            }

            alert("Cadastro realizado com sucesso! Faça login para continuar.");

            formCadastro.reset();
            cardCadastro.style.display = "none";
            cardLogin.style.display = "block";

            document.getElementById("login-email").value = email;
            document.getElementById("login-senha").focus();

        } catch (erro) {
            console.error(erro);
            alert("Não foi possível conectar à API. Verifique se o servidor está rodando.");
        }
    });

    formLogin?.addEventListener("submit", async evento => {
        evento.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const senha = document.getElementById("login-senha").value;

        try {
            const resposta = await fetch("http://localhost:3000/api/usuarios/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.mensagem || "E-mail ou senha inválidos.");
                return;
            }

            if (!dados.usuario || !["cliente", "admin"].includes(dados.usuario.tipo)) {
                alert("Não foi possível identificar o tipo de conta.");
                return;
            }

            localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

            transferirCarrinhoVisitanteParaUsuario(dados.usuario);

            if (dados.usuario.tipo === "admin") {
                window.location.href = "painel-wagner.html";
            } else {
                window.location.href = "perfil.html";
            }

        } catch (erro) {
            console.error(erro);
            alert("Não foi possível conectar à API. Verifique se o servidor está rodando.");
        }
    });
}
