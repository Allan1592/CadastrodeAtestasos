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
        area.innerHTML = "<p>Nenhum registro encontrado.</p>";
        return;
    }

    ativos.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <strong>${r.nome.toUpperCase()}</strong><br>
            <small>Matrícula: ${r.matricula}</small><br>
            <button class="btn-acao azul" style="padding:5px; height:auto; margin-top:5px">EDITAR</button>
        `;
        // Adicionando o clique de forma segura sem usar onclick no HTML (que às vezes causa o erro de CSP)
        card.querySelector('button').addEventListener('click', () => abrirEdicao(r.id));
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
