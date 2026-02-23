// Usando um padrão mais rigoroso para evitar bloqueios de segurança
"use strict";

let db = [];

// Função para carregar dados de forma segura
function carregarDados() {
    const dadosSalvos = localStorage.getItem('meu_sistema_db');
    if (dadosSalvos) {
        try {
            db = JSON.parse(dadosSalvos);
        } catch (e) {
            console.error("Erro ao carregar banco de dados");
            db = [];
        }
    }
}

function salvarNoStorage() {
    localStorage.setItem('meu_sistema_db', JSON.stringify(db));
}

function irPara(idTela) {
    const telas = document.querySelectorAll('.tela');
    telas.forEach(t => t.style.display = 'none');
    
    const telaAtiva = document.getElementById(idTela);
    if (telaAtiva) {
        telaAtiva.style.display = 'block';
    }

    if(idTela === 'telaBanco') listarBanco();
}

// Inicializa os dados assim que o script carrega
carregarDados();

function salvarNovo() {
    const nome = document.getElementById('regNome').value;
    const mat = document.getElementById('regMatricula').value;
    const sol = document.getElementById('regSolicitante').value;
    const data = document.getElementById('regDataPedido').value;

    if(!nome || !mat) {
        alert("Preencha Nome e Matrícula!");
        return;
    }

    const novoRegistro = {
        id: Date.now(),
        nome: nome,
        matricula: mat,
        solicitante: sol,
        dataPedido: data,
        grade: "", 
        dataEnvio: "", 
        ativo: true
    };

    db.push(novoRegistro);
    salvarNoStorage();
    alert("Cadastrado com sucesso!");
    
    // Limpar campos
    document.getElementById('regNome').value = "";
    document.getElementById('regMatricula').value = "";
    
    irPara('menuPrincipal');
}

function listarBanco() {
    const area = document.getElementById('listaBanco');
    if (!area) return;
    area.innerHTML = "";
    
    const ativos = db.filter(r => r.ativo);
    
    if(ativos.length === 0) {
        area.innerHTML = "<p style='text-align:center; padding:30px; color:#666;'>O banco de dados está vazio.</p>";
        return;
    }

    ativos.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-clicavel';
        card.innerHTML = `
            <div>
                <strong style="font-size: 1.2em; color: #2c3e50;">${r.nome.toUpperCase()}</strong><br>
                <span style="color: #666;">Matrícula: <b>${r.matricula}</b> | Solicitante: ${r.solicitante}</span>
            </div>
            <div style="color: #3498db; font-size: 20px;">➔</div>
        `;
        // O card todo vira o botão de editar/ver
        card.onclick = () => abrirEdicao(r.id);
        area.appendChild(card);
    });
}

// Funções de Backup
function exportarBackup() {
    const data = JSON.stringify(db);
    const blob = new Blob([data], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_sistema.json";
    a.click();
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            db = JSON.parse(e.target.result);
            salvarNoStorage();
            alert("Backup Carregado!");
            irPara('menuPrincipal');
        } catch(err) {
            alert("Erro ao ler arquivo.");
        }
    };
    reader.readAsText(file);
}

// Tornando as funções globais para o HTML conseguir ver (necessário no GitHub Pages)
window.irPara = irPara;
window.salvarNovo = salvarNovo;
window.exportarBackup = exportarBackup;
window.importarBackup = importarBackup;

function buscar() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const area = document.getElementById('resultadosBusca');
    
    // Limpa a área se não houver termo de busca
    if (termo.trim() === "") {
        area.innerHTML = "";
        return;
    }

    // Filtra no banco de dados (db) por Nome ou Matrícula
    const resultados = db.filter(r => 
        r.nome.toLowerCase().includes(termo) || 
        r.matricula.toString().includes(termo)
    );

    area.innerHTML = ""; // Limpa resultados anteriores

    if (resultados.length === 0) {
        area.innerHTML = "<p style='color: #e74c3c; font-weight: bold; padding: 10px;'>❌ Nenhum registro encontrado.</p>";
    } else {
        resultados.forEach(r => {
            const card = document.createElement('div');
            card.className = 'card-clicavel';
            
            // Muda a cor da borda: Verde para Ativo, Roxo para Arquivado
            const corStatus = r.ativo ? "#27ae60" : "#9b59b6";
            card.style.borderLeft = `10px solid ${corStatus}`;

            card.innerHTML = `
                <div>
                    <strong style="font-size: 1.1em;">${r.nome.toUpperCase()}</strong><br>
                    <small>Matrícula: ${r.matricula} | Status: <b>${r.ativo ? 'ATIVO' : 'ARQUIVADO'}</b></small>
                </div>
                <div style="color: #3498db;">VER ➔</div>
            `;
            
            // Ao clicar no resultado, abre a tela de edição
            card.onclick = () => abrirEdicao(r.id);
            area.appendChild(card);
        });
    }
}

// OBRIGATÓRIO: Garante que o navegador encontre a função
window.buscar = buscar;
