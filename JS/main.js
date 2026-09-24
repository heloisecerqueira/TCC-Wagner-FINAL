// ==========================================================================
// WAGNER OLIVEIRA MEGA HAIR - MAIN.JS (CONTROLO GERAL E BANCO DE IMAGENS)
// ==========================================================================

// O teu banco de imagens oficial com as 6 opções reais da tua lista
const listaCabelosCatalogo = [
    { nome: "Loiro Mel", imagem: "../PNG/catalogoloiromel.webp" },
    { nome: "Castanho Escuro", imagem: "../PNG/catalogocastanhoescuro.webp"},
    { nome: "Loiro Platinado", imagem: "../PNG/catalogoloiroplatinado.webp" },
    { nome: "Preto Natural", imagem: "../PNG/catalogopreto.jpg" },
    { nome: "Castanho Médio", imagem: "../PNG/catalogocastanhoescuro.webp" },
    { nome: "Loiro Claro", imagem: "../PNG/catalogoloiroclaro.webp" }
];

// Função responsável por construir os cards na página de catálogo
function carregarPaginaCatalogo() {
    const gridCatalogo = document.getElementById("grid-produtos-catalogo");
    
    // Se não estivermos na página de catálogo, sai da função para não gerar erros
    if (!gridCatalogo) return;

    gridCatalogo.innerHTML = "";

    // Percorre a lista e cria cada um dos 6 cards com o botão Personalizar
    listaCabelosCatalogo.forEach(cabelo => {
        const card = document.createElement("div");
        card.className = "product-card";
        
        card.innerHTML = `
            <img src="${cabelo.imagem}" alt="${cabelo.nome}">
            <h3>${cabelo.nome}</h3>
            <p>Cabelo de alta qualidade, fios selecionados, perfeito para alongamento e volume.</p>
            <span class="price">A partir de R$ 350,00</span>
            <button class="btn-card" onclick="window.location.href='personalizar.html'">PERSONALIZAR</button>
        `;
        
        gridCatalogo.appendChild(card);
    });
}

// Atualiza dinamicamente as informações textuais da página de personalização ao interagir
function atualizarEspecificacoesDaPagina() {
    const campoCor = document.getElementById("change-cor");
    const campoComprimento = document.getElementById("change-comprimento");
    const campoTextura = document.getElementById("change-textura");
    const campoEspessura = document.getElementById("change-espessura");

    if (campoCor && document.getElementById("resumo-cor")) {
        document.getElementById("resumo-cor").innerText = campoCor.value;
        if(document.getElementById("custom-product-name")) {
            document.getElementById("custom-product-name").innerText = campoCor.value + " Premium";
        }

        // Atualiza a foto do produto de acordo com a cor escolhida
        const containerImagem = document.getElementById("custom-product-image");
        if (containerImagem) {
            const cabeloEncontrado = listaCabelosCatalogo.find(c => c.nome === campoCor.value);
            if (cabeloEncontrado) {
                containerImagem.innerHTML = `<img src="${cabeloEncontrado.imagem}" alt="${cabeloEncontrado.nome}" style="width:100%; height:100%; object-fit:cover;">`;
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

// Salva a customização e abre automaticamente a janela do carrinho na direita
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
        cor: campoCor.value,
        comprimento: campoComprimento.value,
        textura: campoTextura.value,
        espessura: campoEspessura.value,
        adicionais: campoAdicionais ? campoAdicionais.value : ""
    };

    localStorage.setItem("megaHairPersonalizado", JSON.stringify(megaHairCustomizado));
    
    // Renderiza e exibe o carrinho na tela atual
    atualizarConteudoDoCarrinho();
    abrirCarrinhoLateral();
}

// ==========================================================================
// INJEÇÃO E CONTROLE DO DRAWER LATERAL DO CARRINHO (ESTILO PREMIUM INTEGRADO)
// ==========================================================================
function injetarEstruturaDoCarrinho() {
    // Evita duplicar o elemento se ele já existir na DOM
    if(document.getElementById("carrinho-lateral-container")) return;

    // Elemento Principal da Cortina do Carrinho
    const wrapperCarrinho = document.createElement("div");
    wrapperCarrinho.id = "carrinho-lateral-container";
    wrapperCarrinho.style.cssText = `
        position: fixed; top: 0; right: -400px; width: 100%; max-width: 400px; height: 100vh;
        background-color: #0d0d0d; border-left: 1px solid #222; box-shadow: -5px 0 25px rgba(0,0,0,0.8);
        z-index: 100000; display: flex; flex-direction: column; transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Lato', sans-serif; box-sizing: border-box;
    `;

    // Cabeçalho Interno do Carrinho
    const headerCarrinho = document.createElement("div");
    headerCarrinho.style.cssText = `
        padding: 25px; border-bottom: 1px solid #1f1f1f; display: flex; justify-content: space-between; align-items: center;
    `;
    headerCarrinho.innerHTML = `
        <h3 style="font-family: 'Playfair Display', serif; color: #fff; margin: 0; font-size: 1.4rem; letter-spacing: 0.5px;">Meu Carrinho</h3>
        <button onclick="fecharCarrinhoLateral()" style="background: none; border: none; color: #bfa15f; font-size: 1.5rem; cursor: pointer; display: inline-flex; padding: 5px;"><i class="bi bi-x-lg"></i></button>
    `;

    // Corpo onde caem as personalizações
    const corpoCarrinho = document.createElement("div");
    corpoCarrinho.id = "carrinho-lateral-corpo";
    corpoCarrinho.style.cssText = `
        padding: 25px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;
    `;

    wrapperCarrinho.appendChild(headerCarrinho);
    wrapperCarrinho.appendChild(corpoCarrinho);
    document.body.appendChild(wrapperCarrinho);

    // Cria um fundo escurecido atrás quando abrir o carrinho
    const backgroundOverlay = document.createElement("div");
    backgroundOverlay.id = "carrinho-overlay-fundo";
    backgroundOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6);
        z-index: 99999; display: none; backdrop-filter: blur(2px);
    `;
    backgroundOverlay.addEventListener("click", fecharCarrinhoLateral);
    document.body.appendChild(backgroundOverlay);

    // Vincula o clique de qualquer ícone de carrinho nativo (.bi-cart) para disparar a abertura
    const botoesCarrinhoSite = document.querySelectorAll(".bi-cart");
    botoesCarrinhoSite.forEach(btn => {
        const elementoPai = btn.closest("button") || btn.closest("a");
        if(elementoPai) {
            elementoPai.addEventListener("click", (e) => {
                e.preventDefault();
                atualizarConteudoDoCarrinho();
                abrirCarrinhoLateral();
            });
        }
    });
}

function abrirCarrinhoLateral() {
    document.getElementById("carrinho-lateral-container").style.right = "0";
    document.getElementById("carrinho-overlay-fundo").style.display = "block";
}

function fecharCarrinhoLateral() {
    document.getElementById("carrinho-lateral-container").style.right = "-400px";
    document.getElementById("carrinho-overlay-fundo").style.display = "none";
}

// Atualiza dinamicamente o conteúdo interno com o bloco de personalização ou estado vazio
function atualizarConteudoDoCarrinho() {
    const corpo = document.getElementById("carrinho-lateral-corpo");
    if(!corpo) return;

    const customizacaoSalva = localStorage.getItem("megaHairPersonalizado");

    if (!customizacaoSalva) {
        // Estado Vazio
        corpo.innerHTML = `
            <div style="text-align: center; margin-top: 60px; color: #555;">
                <i class="bi bi-cart-x" style="font-size: 3.5rem; display: block; margin-bottom: 15px; color: #222;"></i>
                <p style="font-size: 0.95rem; margin-bottom: 20px; color: #888;">Seu carrinho está vazio.</p>
                <a href="personalizar.html" onclick="fecharCarrinhoLateral()" class="btn-gold" style="display: inline-block; padding: 10px 25px; text-decoration: none; font-size: 0.85rem;">MONTAR SOB MEDIDA</a>
            </div>
        `;
    } else {
        // Carrinho preenchido com blocos organizados e botão de deletar (X)
        const dados = JSON.parse(customizacaoSalva);
        
        const mensagemZap = encodeURIComponent(
            `Olá Atelier Wagner Oliveira! Montei o meu Mega Hair personalizado no site e gostaria de finalizar a compra.\n\n` +
            `*Especificações do Pedido:* \n` +
            `- Cor Selecionada: ${dados.cor}\n` +
            `- Comprimento: ${dados.comprimento}\n` +
            `- Textura do Fio: ${dados.textura}\n` +
            `- Espessura: ${dados.espessura}\n` +
            `- Observações Adicionais: ${dados.adicionais || 'Nenhuma'}`
        );

        corpo.innerHTML = `
            <div style="background: #141414; border: 1px solid #222; border-radius: 6px; padding: 20px; position: relative;">
                
                <button onclick="removerItemDoCarrinho()" title="Remover Personalização" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #555; font-size: 1.1rem; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#ff4d4d'" onmouseout="this.style.color='#555'">
                    <i class="bi bi-trash3"></i>
                </button>

                <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px; padding-right: 25px;">
                    <div style="background: #222; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #bfa15f; font-size: 1.5rem;">
                        <i class="bi bi-gem"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; color: #fff; font-family: 'Playfair Display', serif; font-size: 1.1rem;">Mega Hair Luxo</h4>
                        <span style="color: #bfa15f; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold;">SOB MEDIDA</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #1f1f1f; padding-top: 15px; font-size: 0.9rem; color: #b3b3b3;">
                    <p style="margin: 0;"><strong style="color: #666;">Cor:</strong> ${dados.cor}</p>
                    <p style="margin: 0;"><strong style="color: #666;">Comprimento:</strong> ${dados.comprimento}</p>
                    <p style="margin: 0;"><strong style="color: #666;">Textura:</strong> ${dados.textura}</p>
                    <p style="margin: 0;"><strong style="color: #666;">Espessura:</strong> ${dados.espessura}</p>
                    
                    <div style="background: #1a1a1a; padding: 10px; border-radius: 4px; margin-top: 5px; font-size: 0.85rem; border-left: 2px solid #bfa15f;">
                        <span style="display: block; font-size: 0.7rem; font-weight: bold; color: #666; margin-bottom: 2px; letter-spacing: 0.5px;">EXTRAS:</span>
                        <span style="font-style: italic; color: #8c8c8c;">${dados.adicionais.trim() !== "" ? `"${dados.adicionais}"` : 'Nenhuma observação informada.'}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: auto; padding-top: 20px;">
                <a href="https://wa.me/5511999998888?text=${mensagemZap}" target="_blank" class="btn-gold" style="display: block; text-align: center; font-size: 0.9rem; padding: 14px; text-decoration: none; box-sizing: border-box; font-weight: bold;">
                    PROSSEGUIR PARA COMPRAR <span>▶</span>
                </a>
            </div>
        `;
    }
}

// Limpa o localStorage e reestrutura a cortina lateral na hora
function removerItemDoCarrinho() {
    localStorage.removeItem("megaHairPersonalizado");
    atualizarConteudoDoCarrinho();
}

// Executa funções de carregamento ao iniciar a página
document.addEventListener("DOMContentLoaded", () => {
    carregarPaginaCatalogo();
    inicializarControlesLogin(); 
    atualizarEspecificacoesDaPagina(); 
    injetarEstruturaDoCarrinho(); // Prepara o carrinho flutuante silenciosamente em segundo plano
});


// ==========================================================================
// LÓGICA EXCLUSIVA PARA A PÁGINA DE LOGIN E CADASTRO
// ==========================================================================
function inicializarControlesLogin() {
    const cardLogin = document.getElementById('card-login');
    const cardCadastro = document.getElementById('card-cadastro');
    
    const linkIrCadastro = document.getElementById('link-ir-cadastro');
    const linkVoltarLogin = document.getElementById('link-voltar-login');
    
    const formLogin = document.getElementById('form-efetuar-login');
    const formCadastro = document.getElementById('form-criar-cadastro');

    if (!cardLogin || !cardCadastro) return;

    linkIrCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        cardLogin.style.display = 'none';
        cardCadastro.style.display = 'block';
    });

    linkVoltarLogin.addEventListener('click', (e) => {
        e.preventDefault();
        cardCadastro.style.display = 'none';
        cardLogin.style.display = 'block';
    });

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });

    formCadastro.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}
